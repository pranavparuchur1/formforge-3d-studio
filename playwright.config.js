import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e', timeout:45000, workers:1, retries:0,
 reporter:[['list'],['html',{open:'never'}],['json',{outputFile:'artifacts/browser-results.json'}]],
 use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1440,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
 projects:[
  {name:'chromium',use:{browserName:'chromium',launchOptions:{executablePath:process.env.CHROMIUM_PATH || undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}}},
 ],
});
