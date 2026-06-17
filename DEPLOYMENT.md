# TaskUp Global - Production Deployment Guide

This document outlines how to take the **TaskUp Global** website and Express backend server live.

Since our backend persists lead data (quote inquiries and trial call bookings) in local JSON files (`data/quotes.json` and `data/bookings.json`), standard container hosting services (which reset their filesystems upon restart/redeploy) will wipe this data unless a **Persistent Disk** is mounted.

Here are the step-by-step instructions for deploying to cloud platforms or custom servers.

---

## Option 1: Deploying to Render (Recommended & Easiest)

Render is a modern cloud platform that provides free/low-cost Web Services and supports persistent disks out of the box.

### Step 1: Push Project to GitHub
Initialize Git in your project folder, create a repository on GitHub, and push your code:
```bash
git init
git add .
git commit -m "Initialize TaskUp Global with Backend"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Create a Web Service on Render
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `taskup-global`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select the Free tier or Starter tier.

### Step 3: Configure Persistent Storage (Crucial)
To prevent your quote/booking files from resetting:
1. In your Render dashboard, navigate to your Web Service, then select **Disks** on the left menu.
2. Click **Add Disk**.
3. Configure the disk settings:
   - **Name**: `taskup-data-disk`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GiB` (more than enough for millions of leads)
4. Save the disk settings.

### Step 4: Configure Environment Variables
1. Go to the **Environment** section on Render.
2. Click **Add Environment Variable**.
3. Add the following key-value pair:
   - **Key**: `DATA_DIR`
   - **Value**: `/var/data`
4. Click **Save Changes**.

Render will automatically deploy. Your website will be live at `https://taskup-global.onrender.com`.

---

## Option 2: Deploying to a Virtual Private Server (VPS)

For full control, you can host on a VPS (DigitalOcean Droplet, Linode, AWS EC2, or Vultr) running Ubuntu.

### Step 1: Prepare the Server
Connect to your VPS via SSH and install Node.js, NPM, and Git:
```bash
sudo apt update
sudo apt install -y nodejs npm git
```

### Step 2: Clone & Install Project
Clone your code from GitHub and install the dependencies:
```bash
git clone <your-github-repo-url>
cd TaskUp
npm install
```

### Step 3: Manage the Process with PM2
Install `pm2` globally to keep the Node process running in the background and restart automatically if the server crashes or restarts:
```bash
sudo npm install -g pm2
pm2 start server.js --name "taskup-global"
pm2 save
pm2 startup
```

### Step 4: Setup a Reverse Proxy (Nginx)
Configure Nginx to route external web traffic (Port 80/443) to your Node application (Port 3000):
```bash
sudo apt install -y nginx
```
Edit the Nginx configuration `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Restart Nginx:
```bash
sudo systemctl restart nginx
```

### Step 5: Secure with SSL (Certbot)
Get a free SSL certificate from Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

---

## Option 3: Deploying with Supabase Database (Enterprise Scaling)

We have pre-configured native **Supabase** database support in the backend! If you set up a Supabase project and define the credentials, the server will automatically write quote submissions and booked calls to your SQL tables instead of local JSON files.

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and log in.
2. Click **New Project** and configure your organization and password.

### Step 2: Create SQL Tables
Go to the **SQL Editor** on the left menu, paste the following SQL script, and click **Run** to generate the required tables:

```sql
-- Create Quotes (Wizard Leads) Table
create table quotes (
  id text primary key,
  name text not null,
  company text not null,
  email text not null,
  phone text not null,
  services text[] not null,
  team_size text not null,
  timeline text not null,
  notes text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Bookings (Trial Appointments) Table
create table bookings (
  id text primary key,
  name text not null,
  company text not null,
  email text not null,
  date text not null,
  time text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Enable read/write access policies (Row Level Security)
alter table quotes enable row level security;
alter table bookings enable row level security;

-- Allow anonymous inserts on quotes
create policy "Allow public quote inserts" on quotes
  for insert with check (true);

-- Allow authenticated reads on quotes (for admin panel)
create policy "Allow auth quote reads" on quotes
  for select using (true);

-- Allow anonymous inserts on bookings
create policy "Allow public booking inserts" on bookings
  for insert with check (true);

-- Allow authenticated reads on bookings (for admin panel)
create policy "Allow auth booking reads" on bookings
  for select using (true);
```

### Step 3: Link Supabase to Your Server
To connect the live backend, configure these environment variables on your cloud hosting panel (e.g., Render, Railway, or Vercel):
1. **`SUPABASE_URL`**: Your project URL (find under *Project Settings -> API*).
2. **`SUPABASE_KEY`**: Your project's anon/public key (find under *Project Settings -> API*).

If these environment variables are set, your server will automatically use the Supabase database. If they are absent, it will continue to write to local JSON files (`data/quotes.json` and `data/bookings.json`).

