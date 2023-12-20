https://medium.com/@evenchange4/deploy-a-commercial-next-js-application-with-pkg-and-docker-5c73d4af2ee

I think you can use: https://github.com/vercel/next.js/tree/canary/examples/with-electron-typescript, as a starting point.

Add name and version to the package.json file, and then yarn pack-app or npm run pack-app should build an executable for your system. I've done it on Mac though, can't vouch for Windows, but you can give it a go.

Otherwise, Tauri is also an option worth exploring, https://tauri.app/v1/guides/building/windows/.



https://github.com/nexe/nexe

