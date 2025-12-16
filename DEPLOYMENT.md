# Deployment Guide for Parkinson's Pal

## Overview
Your application is now fully encrypted and ready for deployment. This guide covers deploying to cloud platforms with PostgreSQL database hosting.

## ⚠️ Current Status
- ✅ End-to-end encryption implemented
- ✅ Backend configured with AES-256-GCM
- ✅ Environment variables and keys generated
- ⚠️ Local PostgreSQL not installed (required for testing/development)
- ⏳ Ready for cloud deployment

## Option 1: Deploy to Heroku (Recommended for Quick Start)

### Prerequisites
- Heroku account (free tier available)
- Git installed

### Steps

1. **Install Heroku CLI**
   ```powershell
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```powershell
   heroku login
   ```

3. **Create Heroku app**
   ```powershell
   cd "c:\Users\leeto\OneDrive\New folder\OneDrive\Desktop\Parkipal project"
   heroku create parkinsons-pal
   ```

4. **Create Procfile** (in backend/ directory)
   ```
   web: node server.js
   ```

5. **Add PostgreSQL add-on**
   ```powershell
   heroku addons:create heroku-postgresql:hobby-dev -a parkinsons-pal
   ```

6. **Set environment variables**
   ```powershell
   heroku config:set JWT_SECRET="8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN" -a parkinsons-pal
   heroku config:set ENCRYPTION_KEY="b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392" -a parkinsons-pal
   heroku config:set ALLOWED_ORIGINS="https://parkinsons-pal.herokuapp.com" -a parkinsons-pal
   heroku config:set NODE_ENV="production" -a parkinsons-pal
   ```

7. **Deploy**
   ```powershell
   git push heroku main
   ```

## Option 2: Deploy to DigitalOcean App Platform

### Steps

1. **Push code to GitHub** (if not already done)
   ```powershell
   git init
   git add .
   git commit -m "Initial commit with encryption"
   git push origin main
   ```

2. **Connect to DigitalOcean**
   - Go to https://cloud.digitalocean.com/
   - Create new App
   - Connect GitHub repository
   - Select `backend` folder as source

3. **Add PostgreSQL database**
   - Click "Add Resources"
   - Select PostgreSQL
   - Choose Basic plan ($12/month)

4. **Set environment variables** in DigitalOcean dashboard:
   ```
   JWT_SECRET=8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN
   ENCRYPTION_KEY=b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-app.ondigitalocean.app
   ```

5. **Deploy** - Automatically deploys on push to main branch

## Option 3: Deploy to AWS

### Using Elastic Beanstalk (Easiest)

1. **Install AWS CLI**
   ```powershell
   pip install awscli
   ```

2. **Configure AWS credentials**
   ```powershell
   aws configure
   ```

3. **Create `.ebextensions/nodecommand.config`**
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "npm start"
   ```

4. **Create `.ebextensions/https.config`**
   ```yaml
   option_settings:
     aws:elb:policies:
       ELBSecurityPolicy-TLS-1-2-2017-01: true
   ```

5. **Deploy**
   ```powershell
   eb init -p node.js-22 parkinsons-pal
   eb create
   eb deploy
   ```

6. **Add RDS PostgreSQL database** via AWS Console

## Option 4: Deploy with Docker to Any VPS

### Requirements
- VPS with Docker installed (DigitalOcean Droplet, Linode, etc.)
- Domain name

### Steps

1. **Create production docker-compose.yml**
   ```yaml
   version: '3.9'
   
   services:
     db:
       image: postgres:16
       environment:
         POSTGRES_DB: parkinsonspal
         POSTGRES_USER: parkinsonspal
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       restart: always
     
     api:
       image: parkinsons-pal:latest
       ports:
         - "3000:3000"
       environment:
         NODE_ENV: production
         JWT_SECRET: ${JWT_SECRET}
         ENCRYPTION_KEY: ${ENCRYPTION_KEY}
         DB_URL: postgres://parkinsonspal:${DB_PASSWORD}@db:5432/parkinsonspal
         ALLOWED_ORIGINS: https://yourdomain.com
       depends_on:
         - db
       restart: always
   
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./certs:/etc/nginx/certs
       depends_on:
         - api
       restart: always
   
   volumes:
     postgres_data:
   ```

2. **Upload to VPS and deploy**
   ```powershell
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Security Checklist for Production

Before deploying:

- [ ] Use strong database passwords (not "change-me")
- [ ] Enable HTTPS/TLS with valid SSL certificate
- [ ] Set restrictive CORS origins (your domain only)
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Enable audit logging
- [ ] Configure automated security updates
- [ ] Set up CDN for static content
- [ ] Enable rate limiting
- [ ] Configure intrusion detection

## Post-Deployment Testing

1. **Test health endpoint**
   ```powershell
   curl https://your-domain/api/health
   ```

2. **Test registration**
   ```powershell
   curl -X POST https://your-domain/api/auth/register `
     -H "Content-Type: application/json" `
     -d '{"username":"test","password":"Test@123"}'
   ```

3. **Test encryption** (verify document upload is encrypted in database)

## Environment Variables Summary

| Variable | Purpose | Example |
|----------|---------|---------|
| JWT_SECRET | Token signing | 8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN |
| ENCRYPTION_KEY | Data encryption | b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392 |
| DB_URL | Database connection | postgres://user:pass@host:5432/db |
| NODE_ENV | Environment | production |
| ALLOWED_ORIGINS | CORS origins | https://yourdomain.com |
| PORT | Server port | 3000 |

## Monitoring & Maintenance

After deployment:

1. **Monitor performance**
   - API response times
   - Database connection pool
   - Memory usage

2. **Monitor security**
   - Unauthorized access attempts
   - Failed login attempts
   - Unusual data access patterns

3. **Regular maintenance**
   - Update dependencies monthly
   - Review audit logs weekly
   - Backup database daily
   - Test disaster recovery monthly

## Support & Troubleshooting

**Encryption key errors?**
- Verify ENCRYPTION_KEY is exactly 64 hex characters

**Database connection errors?**
- Check DB_URL format: `postgres://user:password@host:port/database`
- Verify database is running
- Check firewall rules

**CORS errors?**
- Ensure frontend domain is in ALLOWED_ORIGINS
- Use HTTPS if frontend is HTTPS

## Next Steps

1. Choose deployment option (Heroku recommended for simplicity)
2. Set up database
3. Deploy application
4. Test encryption end-to-end
5. Configure monitoring
6. Set up automated backups
7. Enable audit logging

Questions? Refer to [SECURITY.md](../SECURITY.md) for detailed security information.
