function googleLogin(domain) {
  return `mail.google.com/a/${domain}`;
}

export default {
  'gmail.com': googleLogin,
  'google.com': googleLogin,
  'googlemail.com': googleLogin,
  'hotmail.com': 'https://login.live.com/',
  'msn.com': 'https://login.live.com/',
  'outlook.com': 'https://login.microsoftonline.com/',
  'yahoodns.net': 'https://login.yahoo.com/',
};
