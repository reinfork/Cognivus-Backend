const supabase = require('../config/supabase');
const storage = require('../middleware/storage');
const { daysLeft } = require('../helper/validity');

const bucket = 'popups';

// Show the expiry reminder once the class period is this close to ending
const REMINDER_DAYS = 30;

// Only these roles may manage the announcement image
const ADMIN_ROLES = ['admin', 'owner', 'moderator', 'developer'];

const isAdmin = (req) => ADMIN_ROLES.includes(req.user?.role);

// the student's own class validity, when it is close enough to warn about
const fetchExpiry = async (req) => {
  if (req.user?.role !== 'student') return null;

  const { data: user, error } = await supabase
    .from('tbuser')
    .select('deactivate_at')
    .eq('userid', req.user.id)
    .single();

  if (error) throw error;
  if (!user?.deactivate_at) return null;

  const remaining = daysLeft(user.deactivate_at);
  if (remaining > REMINDER_DAYS) return null;

  return {
    type: 'expiry',
    deactivate_at: user.deactivate_at,
    days_left: remaining
  };
};

const buildPayload = (body = {}) => {
  const payload = {};
  if (body.link_url !== undefined) payload.link_url = body.link_url === '' ? null : body.link_url;
  if (body.is_active !== undefined) payload.is_active = body.is_active === 'true' || body.is_active === true;
  return payload;
};

// fetch the single popup row, optionally filtered to active-only
const fetchRow = async (activeOnly = false) => {
  let query = supabase.from('tbpopup').select().order('popupid', { ascending: false }).limit(1);
  if (activeOnly) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) throw error;
  return data?.[0] ?? null;
};

// what a student should see on entering the dashboard: their own class expiry
// reminder takes priority, otherwise the global announcement image
exports.getActive = async (req, res) => {
  try {
    const expiry = await fetchExpiry(req);
    if (expiry) return res.json({ success: true, data: expiry });

    const image = await fetchRow(true);
    if (!image) return res.json({ success: true, data: null });

    return res.json({ success: true, data: { ...image, type: 'image' } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching active popup',
      error: error.message
    });
  }
};

// current popup for admin
exports.get = async (req, res) => {
  try {
    return res.json({ success: true, data: await fetchRow() });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching popup',
      error: error.message
    });
  }
};

// create or replace popup (upload deletes previous image)
exports.upsert = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const row = await fetchRow();
    const payload = buildPayload(req.body);
    const now = new Date().toISOString();

    if (req.file) {
      const oldPath = row?.path;
      const newPath = `popup_${Date.now()}`;
      await storage.upload(newPath, req.file, bucket);
      if (oldPath) await storage.delete(oldPath, bucket);
      payload.path = newPath;
      payload.url = await storage.getPublicUrl(newPath, bucket);
    }

    payload.updated_at = now;

    if (row) {
      const { data, error } = await supabase
        .from('tbpopup')
        .update(payload)
        .eq('popupid', row.popupid)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required to create a popup' });
    }

    payload.created_at = now;

    const { data, error } = await supabase
      .from('tbpopup')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error saving popup',
      error: error.message
    });
  }
};

// delete popup and its image
exports.remove = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const row = await fetchRow();
    if (!row) {
      return res.status(404).json({ success: false, message: 'Popup not found' });
    }

    if (row.path) await storage.delete(row.path, bucket);

    const { error } = await supabase
      .from('tbpopup')
      .delete()
      .eq('popupid', row.popupid);

    if (error) throw error;

    return res.json({ success: true, message: 'Popup deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting popup',
      error: error.message
    });
  }
};
