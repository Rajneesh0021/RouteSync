const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
};

const mapReplacements = [
  // Typography & Sizing
  [/h-20/g, 'h-14'],
  [/h-18/g, 'h-12'],
  [/h-16/g, 'h-12'],
  [/h-14/g, 'h-12'],
  [/text-4xl/g, 'text-2xl'],
  [/text-3xl/g, 'text-xl'],
  [/text-[lg]/g, 'text-sm'],  // Wait, text-lg
  [/text-lg/g, 'text-sm'],
  [/text-xl/g, 'text-base'],
  [/p-12/g, 'p-6'],
  [/p-16/g, 'p-8'],
  [/rounded-\[4rem\]/g, 'rounded-3xl'],
  [/rounded-\[3.5rem\]/g, 'rounded-3xl'],
  [/rounded-\[2.5rem\]/g, 'rounded-2xl'],
  [/tracking-widest/g, 'tracking-normal'],
  [/tracking-tighter/g, 'tracking-normal'],
  [/tracking-\[0.3em\]/g, 'tracking-normal'],
  // Jargon Replacements - Login
  [/System Access/g, 'Sign In'],
  [/RouteSync Security Terminal Node-01/g, 'Welcome back to RouteSync'],
  [/System Terminal ID/g, 'Email Address'],
  [/Secure Access Pin/g, 'Password'],
  [/Security Pin/g, 'Password'],
  [/Authorize Terminal/g, 'Sign In'],
  [/Decrypting.../g, 'Signing In...'],
  [/New Terminal Node\?/g, "Don't have an account?"],
  [/Initialize Link →/g, 'Sign Up →'],
  [/Initialize Link/g, 'Sign Up'],
  [/Node Recovery/g, 'Reset Password'],
  [/Restore System Link Credentials/g, 'Enter your email to reset your password'],
  [/Target Email Address/g, 'Email Address'],
  [/Transmit Security Pin/g, 'Send Reset Link'],
  [/Authorization Pin code/g, 'OTP Code'],
  [/New Secure System Pin/g, 'New Password'],
  [/Update Node Credentials/g, 'Update Password'],
  [/Revoke Pin \& Re-try/g, 'Cancel \x26 Retry'],
  [/System Profile/g, 'Profile'],
  [/Terminate Link/g, 'Log Out'],
  // Jargon Replacements - Register
  [/Establish New Terminal Protocol/g, 'Create a new account'],
  [/Manual Protocols/g, 'Or continue with'],
  [/Terminal Name/g, 'Full Name'],
  [/Link Protocol \(Phone\)/g, 'Phone Number'],
  [/Fleet Vehicle Initializer/g, 'Vehicle Information'],
  [/Plate Index \(e.g. DL1C-1234\)/g, 'Vehicle Number (e.g. DL1C-1234)'],
  [/Vehicle Platform Type/g, 'Vehicle Type'],
  [/Vehicle Physical Model/g, 'Vehicle Model'],
  [/Max Node Load \(Seats\)/g, 'Passenger Capacity'],
  [/Request Secure Pin/g, 'Sign Up'],
  [/Identity Verification/g, 'Verify Email'],
  [/Authorize System Registration/g, 'Verify \x26 Register'],
  [/Modify Terminal Data/g, 'Edit Details'],
  [/Active Terminal Node\?/g, 'Already have an account?'],
  [/Initialize Access →/g, 'Sign In →'],
  // Jargon Replacements - Dashboard
  [/Operator Matrix Incomplete/g, 'Driver Profile Incomplete'],
  [/Your hardware identity is missing Vehicle Plate Numbers or passenger capacity limits. You cannot initialize a Fleet Node until setup is finalized./g, 'Please complete your vehicle details in your profile to go online as a driver.'],
  [/Synchronize Terminal Profile/g, 'Complete Profile'],
  [/Fleet Operator/g, 'Driver Status'],
  [/Active Transmission Node/g, 'Online'],
  [/Route Initialization/g, 'Offline'],
  [/Acquiring Live GPS Node.../g, 'Locating...'],
  [/Initialize System Route/g, 'Set Route'],
  [/Active GPS Hard-Lock/g, 'GPS Active'],
  [/Final Destination Node.../g, 'Destination...'],
  [/Available Slots/g, 'Available Seats'],
  [/Launch Node/g, 'Go Online'],
  [/Active Matrix:/g, 'Heading to:'],
  [/Modify Route Matrix/g, 'Edit Route'],
  [/Live Node Queue/g, 'Passenger Requests'],
  [/System Command/g, 'Admin Dashboard'],
  [/Master Node Management/g, 'Manage Platform'],
  [/Fleet Terminals/g, 'Drivers'],
  [/User Matrix/g, 'Users'],
  [/Provision Worker/g, 'Add Employee'],
  [/Operator Name/g, 'Full Name'],
  [/Link Relay \(Email\)/g, 'Email'],
  [/Hardware Device \(Phone\)/g, 'Phone Number'],
  [/Terminal Scope \(Role\)/g, 'Role'],
  [/Hardware Vehicle Matrix/g, 'Vehicle Details'],
  [/Government Plate Index/g, 'Vehicle Number'],
  [/Synchronize Mainframe/g, 'Save Profile'],
  [/Terminal/g, 'Account']
];

walkDir(path.join(__dirname, 'src/pages'), (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;
    mapReplacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    // Remove italic from headers to look cleaner
    content = content.replace(/italic uppercase/g, '');
    content = content.replace(/uppercase italic/g, '');
    content = content.replace(/italic/g, '');
    
    // Reduce font-black to font-bold for a safer mobile look
    content = content.replace(/font-black/g, 'font-bold');
    
    if (content !== oldContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});

walkDir(path.join(__dirname, 'src/components'), (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;
    mapReplacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    content = content.replace(/font-black/g, 'font-bold');
    if (content !== oldContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});

