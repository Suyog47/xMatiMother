# xMati Mother Application

A standalone React application built with **Node.js 23.4.0** featuring three main screens from the xMati project:

## 🎯 Features

### 1. 📝 Registration Wizard
- Multi-step registration process
- Email verification with OTP
- Organization information collection
- Payment card validation with Stripe
- Subscription plan selection
- Real-time form validation

### 2. 💳 Subscription Management
- View and manage subscription plans (Starter & Professional)
- Stripe payment processing
- Transaction history with detailed view
- Smart upgrade/downgrade calculations
- Automatic refund handling
- Monthly and yearly billing options

### 3. ⚙️ Admin Control Panel
- View all registered users
- User subscription management
- System maintenance controls
- Backup and restore to S3
- User enquiry management
- Real-time user data display

## 🚀 Getting Started

### Prerequisites
- Node.js 23.4.0 (managed automatically via `.nvmrc`)
- npm 11.0.0 or higher
- nvm (Node Version Manager) - recommended

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/suyogamin/Documents/xmati-mother
   ```

2. **Use the correct Node version:**
   ```bash
   nvm install
   nvm use
   ```
   
   You should see: `Now using node v23.4.0 (npm v11.0.0)`

3. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   
   The app will open at [http://localhost:3000](http://localhost:3000)

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
xmati-mother/
├── .nvmrc                          # Node version specification
├── .env                            # Environment variables
├── package.json                    # Dependencies and scripts
├── README.md                       # This file
├── public/                         # Static files
└── src/
    ├── index.tsx                   # Application entry point
    ├── App.tsx                     # Main application component
    ├── App.css                     # Global styles
    ├── auth/
    │   └── basicAuth.ts           # Authentication utility
    ├── utils/
    │   ├── shared.ts              # Shared utilities (toast, auth)
    │   └── api.ts                 # API service
    ├── assets/
    │   └── images/                # Image assets
    ├── components/
    │   ├── Subscription/          # Subscription management
    │   │   ├── Subscription.tsx
    │   │   ├── CheckoutForm.tsx
    │   │   ├── TransactionHistory.tsx
    │   │   └── dialogs/
    │   │       ├── PaymentSuccessDialog.tsx
    │   │       ├── PaymentFailedDialog.tsx
    │   │       ├── LicenseInvoiceDialog.tsx
    │   │       ├── SubscriptionCancelConfirmDialog.tsx
    │   │       ├── SubscriptionCancelledDialog.tsx
    │   │       └── CancellationFailedDialog.tsx
    │   ├── Wizard/                # Registration wizard
    │   │   ├── index.tsx
    │   │   ├── MainScreen.tsx
    │   │   ├── style.css
    │   │   └── steps/
    │   │       ├── PersonalInfo.tsx
    │   │       ├── EmailVerification.tsx
    │   │       ├── OrganizationInfo.tsx
    │   │       ├── PaymentInfo.tsx
    │   │       └── SubscriptionPlan.tsx
    │   └── AdminControl/          # Admin panel
    │       ├── AdminControl.tsx
    │       ├── UserCard.tsx
    │       └── EnquiryDialog.tsx
    └── styles/                    # Additional stylesheets
```

## 🔧 Technologies Used

- **React** 19.2.0 - UI framework
- **TypeScript** - Type safety
- **Blueprint UI** 3.x - Component library
- **Stripe** - Payment processing
- **React Router** 5.x - Navigation
- **Axios** - HTTP client
- **Moment.js** - Date handling
- **React Icons** - Icon library

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=https://www.app.xmati.ai/apis
REACT_APP_STRIPE_PROMISE=pk_live_51RPPI0EncrURrNgDF2LNkLrh5Wf53SIe3WjqPqjtzqbJWDGfDFeG4VvzUXuC4nCmrPTNOTeFENuAqRBw1mvbNJg600URDxPnuc
```

## 📝 Usage

### Accessing Different Screens

1. **Home Page** - Navigate using the top menu
2. **Registration Wizard** - Click "Registration Wizard" or navigate to `/wizard`
3. **Subscription Management** - Click "Subscription Management" button
4. **Admin Control Panel** - Click "Admin Control Panel" button

### Local Storage

The application uses localStorage for:
- `formData` - User registration data
- `subData` - Subscription information
- `token` - Authentication token
- `userData` - User session data

### Sample Data for Testing

For testing purposes, you can set localStorage manually:

```javascript
localStorage.setItem('formData', JSON.stringify({
  email: 'test@example.com',
  fullName: 'Test User',
  stripeCustomerId: 'cus_test123',
  stripePayementId: 'pm_test123'
}));

localStorage.setItem('subData', JSON.stringify({
  subscription: 'Starter',
  amount: '$19',
  duration: 'monthly',
  expired: false,
  canCancel: true
}));
```

## 🐛 Troubleshooting

### Node Version Issues
If you see module not found errors:
```bash
nvm use 23.4.0
```

### Install Issues
If npm install fails:
```bash
npm install --legacy-peer-deps --force
```

### Port Already in Use
If port 3000 is taken:
```bash
PORT=3001 npm start
```

## 🔐 Security Notes

- Never commit `.env` files to version control
- Stripe keys shown are for development only
- In production, use environment-specific configuration
- Implement proper authentication before deployment

## 📦 Build & Deployment

### Development Build
```bash
npm run build
```

### Production Deployment
1. Set production environment variables
2. Build the application
3. Deploy the `build/` folder to your hosting service

## 🤝 Contributing

This is a standalone demonstration project. The functionality is copied from the main xMati project located at `/Users/suyogamin/Documents/xMati`.

## 📄 License

Proprietary - xMati

## 🆘 Support

For issues or questions:
- Check the console for error messages
- Verify Node version: `node -v` should show `v23.4.0`
- Check that all dependencies are installed
- Review browser console for runtime errors

## ✅ Verification Checklist

- [ ] Node 23.4.0 is active (`nvm use 23.4.0`)
- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] `.env` file configured
- [ ] Development server starts (`npm start`)
- [ ] All three screens are accessible
- [ ] No console errors on load

---

**Created:** November 5, 2025  
**Node Version:** 23.4.0  
**Status:** ✅ Ready for Development
