# Kaholo Puppeteer Plugin
This plugin enables Kaholo to run [Puppeteer](https://pptr.dev/) tests. Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the [DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/). Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium. Puppeteer test are written using JavaScript.

Simple Example Puppeteer test file `example.js`

    const puppeteer = require('puppeteer');

    (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(process.env.TESTED_URL);
    await page.screenshot({path: 'example.png'});
    await browser.close();
    })();

    console.log(`Screenshot example.png taken of ${process.env.TESTED_URL}`);

Using `console.log()` sends results to the Kaholo execution's Final Result. Final Result is best using JSON, e.g. `console.log(JSON.stringify({ "status": "PASS" }))`. This makes it easy for actions downstream in your Kaholo pipeline to access data from the result using a single line of code, e.g. `kaholo.actions.puppeteer1.result.status`.

Test parameters to be specified by the Kaholo plugin should appear in the Puppeteer tests as environment variables, in the example above `process.env.TESTED_URL` is an environment variable named `TESTED_URL`. By configuring `TESTED_URL=http://www.kittens.com/` in the plugin with the above `example.js` test, the resulting screenshot will most likely contain some kittens.

Often tests will be separated into stages, such that one test should continue where the previous test left off. In Puppeteer this is done by preserving the user data in the test as files on the disk - userDataDir. Also, to run inside a docker container the test must NOT use the default sandboxing features, they must be disabled. These settings are made when launching the browser, as seen in the following example snippet of Puppeteer test code.

        const browser = await puppeteer.launch({
            userDataDir: './userdatadir',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

## Prerequisites
Puppeteer tests must be developed by test engineers and copied onto the Kaholo agent, typically using the [Git plugin](https://github.com/Kaholo/kaholo-plugin-git) with method `Clone Repository`. All the software prerequisites are handled by the plugin by running the tests within a docker container.

## Use of Docker
This plugin makes use of the [buildkite/puppeteer](https://hub.docker.com/r/buildkite/puppeteer/) docker image to run Puppeteer. This has many upsides but a few downsides as well of which the user should be aware.

If running your own Kaholo agents in a custom environment, you will have to ensure docker is installed and running on the agent and has sufficient privilege to retrieve the image and start a container. If the agent is already running in a container (kubernetes or docker) then this means a docker container running within another container.

The first time the plugin is used on each agent, docker may spend a minute or two downloading the image. After that the delay of starting up another docker image each time is quite small, a second or two.

Because the Puppeteer tests are running inside a docker container, they will not have access to the filesystem on the agent. This is why parameter "Working Directory" is necessary. The directory specified as Working Directory will be mounted as a docker volume so files can be read and written by the Puppeteer test so long as they are within this directory or a subdirectory. Files written there will remain available after execution on the Kaholo agent, even though the Puppeteer docker image is destroyed.

Should these limitations negatively impact on your use case, [please let us know](https://kaholo.io/contact/).

## Access and Authentication
There is not access or authentication requirement other than the URL being tested must be reachable on the network by the Kaholo agent. The Puppeteer tests themselves are responsible fro authenticating with the application being tested.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Plugin Settings
Plugin settings act as default parameter values. If configured in plugin settings, the action parameters may be left unconfigured. Action parameters configured anyway over-ride the plugin-level settings for that Action.
* Default Working Directory - left unconfigured the default working directory is determined by the Kaholo agent, normally a directory named `workspace`. If configured it may be either a path relative from there or an absolute path (one beginning with `/`).

For example use Git plugin to clone a test repository to `myrepo` and then the Puppeteer Test File may be found at `myrepo/puppeteer/uitests/auth/login-test.js`, and Working Directory left unconfigured. Alternately one could use Working Directory of `myrepo/puppeteer/uitests/auth/` and then the Puppeteer Test File is just `login-test.js`. Furthermore if one Git clones to absolute /my/path/myrepo, the Working Directory may be `/my/path/myrepo/puppeteer/uitests/auth/`, or left unconfigured and then the full abosulte path and file name provided for the Puppeteer Test File - `/my/path/myrepo/puppeteer/uitests/auth/login-test.js`.

## Method: Run Puppeteer Test
This method runs a Puppeteer Test.

### Parameters
* Working Directory - a directory on the Kaholo agent containing the test file and any input/output files created or used by the test. If omitted, the default working directory on the Kaholo agent is used. Use Command Line plugin to run command `pwd` if you do not know your agent's default working directory.
* Puppeteer Test File - the path to the JavaScript Puppeteer test file to execute, either relative to the Working Directory or absolute.
* Environment Variables - key=value pairs that will become environment variables when the test is executed. This is a flexible method to inject configured values into the Puppeteer test without changes being made to the test's JavaScript code.