# Railway Deployment Guide

## Prerequisites
1. Railway account (sign up at [railway.app](https://railway.app))
2. GitHub repository with your code
3. MySQL database (Railway provides this)

## Step 1: Prepare Your Repository

Your repository is already configured for Railway deployment with:
- `railway.json` - Railway configuration
- Updated `package.json` with build scripts
- Backend server configured to serve React build

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Connect GitHub to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**
   - In your Railway project dashboard, go to "Variables"
   - Add the following environment variables:

```env
# Database (Railway will provide this)
DATABASE_URL=your_railway_mysql_url

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@rezagemcollection.shop
EMAIL_PASS=your_app_password

# Staff Emails
STAFF_EMAIL_1=imaan.farasat@gmail.com
STAFF_EMAIL_2=rezagemcollection@gmail.com

# Business Configuration
BUSINESS_NAME=Reza Gem Collection
BUSINESS_ADDRESS=30 Bertrand Ave Unit A1 & A2, Scarborough, ON M1L 2P5, Canada
OPENING_HOUR=11
CLOSING_HOUR=17
SLOT_DURATION=15
TIMEZONE=America/Toronto

# Frontend URL (Railway will provide this)
FRONTEND_URL=https://your-app-name.railway.app

# Node Environment
NODE_ENV=production
```

3. **Add MySQL Database**
   - In Railway dashboard, click "New"
   - Select "Database" → "MySQL"
   - Railway will automatically provide the `DATABASE_URL`

4. **Deploy**
   - Railway will automatically detect your build configuration
   - It will run `npm run build` to build the frontend
   - Then run `npm start` to start the backend server

### Option B: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize and Deploy**
   ```bash
   railway init
   railway up
   ```

## Step 3: Configure Domain (Optional)

1. **Custom Domain**
   - In Railway dashboard, go to "Settings"
   - Add your custom domain
   - Update DNS records as instructed

2. **SSL Certificate**
   - Railway automatically provides SSL certificates
   - No additional configuration needed

## Step 4: Verify Deployment

1. **Check Build Logs**
   - In Railway dashboard, check the "Deployments" tab
   - Ensure build completed successfully

2. **Test the Application**
   - Visit your Railway URL
   - Test the booking flow
   - Verify email notifications work

3. **Database Verification**
   - Check that tables are created
   - Test booking creation

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version (>=16.0.0)

2. **Database Connection Issues**
   - Ensure `DATABASE_URL` is set correctly
   - Check that MySQL service is running

3. **Email Not Working**
   - Verify email credentials
   - Check Gmail app password settings
   - Ensure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` are set

4. **Frontend Not Loading**
   - Check that build completed successfully
   - Verify static files are being served

### Environment Variables Checklist

Make sure these are set in Railway:
- [ ] `DATABASE_URL`
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASS`
- [ ] `STAFF_EMAIL_1`
- [ ] `STAFF_EMAIL_2`
- [ ] `FRONTEND_URL`
- [ ] `NODE_ENV=production`

## Monitoring

1. **Logs**
   - View real-time logs in Railway dashboard
   - Monitor for errors and performance

2. **Metrics**
   - Railway provides basic metrics
   - Monitor response times and errors

3. **Database**
   - Monitor database connections
   - Check table sizes and performance

## Updates

To update your application:
1. Push changes to GitHub
2. Railway will automatically redeploy
3. Monitor the deployment logs
4. Test the updated application

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- GitHub Issues: Create issues in your repository 