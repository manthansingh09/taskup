require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Supabase (if keys are provided in environment variables)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: WebSocket
    }
  });
  console.log("====================================================");
  console.log(" Supabase Database Integration Active");
  console.log("====================================================");
} else {
  console.log("====================================================");
  console.log(" Supabase credentials not found. Falling back to local JSON files.");
  console.log("====================================================");
}

// Local Database settings
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const quotesPath = path.join(dataDir, 'quotes.json');
const bookingsPath = path.join(dataDir, 'bookings.json');

if (!supabase) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(quotesPath)) {
    fs.writeFileSync(quotesPath, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(bookingsPath)) {
    fs.writeFileSync(bookingsPath, JSON.stringify([], null, 2));
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Helper functions for Local File I/O
function readDatabase(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading database file at ${filePath}:`, error);
    return [];
  }
}

function writeDatabase(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing database file at ${filePath}:`, error);
    return false;
  }
}

// Basic Authentication Middleware for Admin routes
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="TaskUp Global Operations Admin"');
    return res.status(401).send('Access denied. Authentication required.');
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'TaskupAdmin1234@';

  if (user === expectedUser && pass === expectedPass) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="TaskUp Global Operations Admin"');
    return res.status(401).send('Invalid credentials.');
  }
}

/* ==========================================================================
   Public Form API Endpoints
   ========================================================================== */

// Handle Custom Quote Form Submissions
app.post('/api/quote', async (req, res) => {
  const { name, company, email, phone, services, teamSize, timeline, notes } = req.body;

  if (!name || !company || !email || !phone) {
    return res.status(400).json({ success: false, error: 'Missing required profile details.' });
  }

  const payload = {
    id: 'q_' + Date.now() + Math.floor(Math.random() * 100),
    name,
    company,
    email,
    phone,
    services: Array.isArray(services) ? services : [services],
    teamSize: teamSize || '1 Dedicated Assistant',
    timeline: timeline || 'Immediate (1-2 Weeks)',
    notes: notes || '',
    timestamp: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('quotes')
        .insert([{
          id: payload.id,
          name: payload.name,
          company: payload.company,
          email: payload.email,
          phone: payload.phone,
          services: payload.services,
          team_size: payload.teamSize,
          timeline: payload.timeline,
          notes: payload.notes,
          timestamp: payload.timestamp
        }]);

      if (error) throw error;
      res.status(200).json({ success: true, id: payload.id });
    } catch (err) {
      console.error('Supabase write error for quote:', err);
      res.status(500).json({ success: false, error: 'Database error: ' + err.message });
    }
  } else {
    const quotes = readDatabase(quotesPath);
    quotes.unshift(payload);
    if (writeDatabase(quotesPath, quotes)) {
      res.status(200).json({ success: true, id: payload.id });
    } else {
      res.status(500).json({ success: false, error: 'Database write error.' });
    }
  }
});

// Handle Trial Calendar Bookings
app.post('/api/schedule', async (req, res) => {
  const { name, company, email, date, time } = req.body;

  if (!email || !date || !time) {
    return res.status(400).json({ success: false, error: 'Missing required scheduling inputs.' });
  }

  const payload = {
    id: 'b_' + Date.now() + Math.floor(Math.random() * 100),
    name: name || 'Anonymous Client',
    company: company || 'Not Specified',
    email,
    date,
    time,
    timestamp: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          id: payload.id,
          name: payload.name,
          company: payload.company,
          email: payload.email,
          date: payload.date,
          time: payload.time,
          timestamp: payload.timestamp
        }]);

      if (error) throw error;
      res.status(200).json({ success: true, id: payload.id });
    } catch (err) {
      console.error('Supabase write error for booking:', err);
      res.status(500).json({ success: false, error: 'Database error: ' + err.message });
    }
  } else {
    const bookings = readDatabase(bookingsPath);
    bookings.unshift(payload);
    if (writeDatabase(bookingsPath, bookings)) {
      res.status(200).json({ success: true, id: payload.id });
    } else {
      res.status(500).json({ success: false, error: 'Database write error.' });
    }
  }
});

/* ==========================================================================
   Secured Admin API Endpoints
   ========================================================================== */

// Return all quote and booking logs (Authorized only)
app.get('/api/admin/leads', adminAuth, async (req, res) => {
  if (supabase) {
    try {
      const [quotesRes, bookingsRes] = await Promise.all([
        supabase.from('quotes').select('*').order('timestamp', { ascending: false }),
        supabase.from('bookings').select('*').order('timestamp', { ascending: false })
      ]);

      if (quotesRes.error) throw quotesRes.error;
      if (bookingsRes.error) throw bookingsRes.error;

      // Map database columns back to camelCase frontend properties
      const quotesMapped = (quotesRes.data || []).map(q => ({
        id: q.id,
        name: q.name,
        company: q.company,
        email: q.email,
        phone: q.phone,
        services: q.services,
        teamSize: q.team_size,
        timeline: q.timeline,
        notes: q.notes,
        timestamp: q.timestamp
      }));

      res.status(200).json({
        success: true,
        quotes: quotesMapped,
        bookings: bookingsRes.data || []
      });
    } catch (err) {
      console.error('Supabase read error:', err);
      res.status(500).json({ success: false, error: 'Database read error: ' + err.message });
    }
  } else {
    const quotes = readDatabase(quotesPath);
    const bookings = readDatabase(bookingsPath);
    res.status(200).json({ success: true, quotes, bookings });
  }
});

// Clear lists for resetting demo entries (Authorized only)
app.post('/api/admin/clear', adminAuth, async (req, res) => {
  const { type } = req.body;

  if (supabase) {
    try {
      if (type === 'quotes') {
        const { error } = await supabase.from('quotes').delete().neq('id', '');
        if (error) throw error;
      } else if (type === 'bookings') {
        const { error } = await supabase.from('bookings').delete().neq('id', '');
        if (error) throw error;
      } else {
        const [err1, err2] = await Promise.all([
          supabase.from('quotes').delete().neq('id', ''),
          supabase.from('bookings').delete().neq('id', '')
        ]);
        if (err1.error) throw err1.error;
        if (err2.error) throw err2.error;
      }
      res.status(200).json({ success: true, message: 'Database cleared successfully.' });
    } catch (err) {
      console.error('Supabase clear error:', err);
      res.status(500).json({ success: false, error: 'Database clear error: ' + err.message });
    }
  } else {
    if (type === 'quotes') {
      writeDatabase(quotesPath, []);
    } else if (type === 'bookings') {
      writeDatabase(bookingsPath, []);
    } else {
      writeDatabase(quotesPath, []);
      writeDatabase(bookingsPath, []);
    }
    res.status(200).json({ success: true, message: 'Databases successfully cleared.' });
  }
});

/* ==========================================================================
   Static Files & Routing
   ========================================================================== */

// Secure admin.html page with browser credentials
app.get('/admin.html', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` TaskUp Global Backend Server Online`);
  console.log(` Address: http://localhost:${PORT}`);
  console.log(` Admin Portal Secured via Basic Auth`);
  console.log(`====================================================`);
});
