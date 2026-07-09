// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactCompiler: true,

//   allowedDevOrigins: [
//     "localhost",
//     "127.0.0.1",
//     ".local",
//     "192.168.*",
//     "10.0.*",
//     "172.16.*",
//   ],
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  allowedDevOrigins: ['192.168.8.101', 'localhost', '127.0.0.1'],
};

export default nextConfig;


