import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.mukhattati.planner',
  appName: 'Daily Planner',
  webDir: 'dist',
  // The installed app loads the live site, so every deploy reaches it without reinstalling.
  plugins: { FirebaseAuthentication: { skipNativeAuth: true, providers: ['google.com'] } },
  server: { url: 'https://mohamedelsafy1.github.io/daily-planner/' },
}

export default config
