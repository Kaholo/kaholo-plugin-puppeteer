# Kaholo Puppeteer Plugin
This plugin is purpose-built to run Puppeteer test scripts. It is not required for Puppeteer but is provided as a convenience - allowing for easy injection of environment variables and also installing the puppeteer npm package on the agent for you, which includes the chromium headless browser. Puppeteer tests could also be run using the Command Line plugin and executing a command such as `node my-puppeteer-test.js`.

This plugin should be used to run only headless puppeteer tests, because the Kaholo Agent has no way to display a browser window. Tests are normally placed on the Kaholo agent using the TextEditor plugin or the Git plugin to clone them there as a repo.

## Prerequisites
As of Q3 2022, a typical Kaholo agent does not have all the libraries required for chromium installed. These can be installed using the Command Line plugin with the following command:

    apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev

Puppeteer test scripts used with this plugin also require some special consideration. First, they should be headless, including no `headless: false` configuration in calls to `puppeteer.launch()`.

Next, because plugins run as user `root` on Kaholo Agents, `puppeteer.launch()` must also disable the sandboxing features. For example,

    const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

Lastly, to make use of any environment variables the script should contain code `process.env.[variable]` to use them. For example, if `WEB_URL=https://www.kaholo.io`,

    await page.goto(process.env.WEB_URL, { waitUntil: 'networkidle0' });

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Method: Run Puppeteer Test
This method runs `node [Puppeteer JavaScript File]` from within `[Working Directory]` with environment variables set according to `[Environment Variables]`.

### Parameter: Working Directory
This is a path from within which the JavaScript Puppeteer test is run. It is commonly the directory containing the JavaScript file. If omitted it will be the default working directory, which is `/usr/src/app/workspace` in Kaholo version 4.x.

### Parameter: JavaScript File
The path to a JavaScript File, either absolute or relative from `[Working Directory]`. If the file is inside `[Working Directory]`, just the filename is sufficient.

### Parameter: Environment Variables
A list of Key=value pairs, one per line that will become environment variables. For example,

    TEST_ENV=http://qa01.kaholo.int
    repetitions=3

This will result in `$TEST_ENV` and `$repetitions` being set in the environment to `http://qa01.kaholo.int` and `3`, respectively.