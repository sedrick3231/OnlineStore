export  function getLoginContext(req) {
  return {
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  };
}

export default function loginAttemptFromNewDevice(user, req) {
  const { ip, userAgent } = getLoginContext(req);

  // Optionally normalize IP/User-Agent
  const knownDevices = user.loginDevices || [];

  const isKnown = knownDevices.some(device =>
    device.ip === ip && device.userAgent === userAgent
  );

  return !isKnown;
}
