<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Twilio Flex Plugin - Supervisor Barge-In and Coach

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

This plugin adds a barge-in and coach button to the Monitor call canvas.  You can get to this via the Team View, click on the agent you wish to monitor and the buttons will be available once you begin to monitor the live calls.  The left button is the Barge-In button which allows you to join the conference all with the agent(s) and customer(s).  Toggling this button will mute/unmute yourself.  The right button is the Coach button which allows you to talk to the agent you are monitoring.  The no other member of the call will be able to hear you except for the monitored agent.  Toggling this button enables Coach and the left button converts to a Mute/Un-Mute button for the coaching mode.

First select the call/worker you wish to monitor

![Plugin Demo](https://github.com/aestellwag/plugin-supervisor-barge-coach/blob/main/Supervisor-Barge-Coach-Plugin-1.gif)

Click the Monitor button to enable the Barge-In Button (Left Button) and Coach Button (Right Button)

![Plugin Demo](https://github.com/aestellwag/plugin-supervisor-barge-coach/blob/main/Supervisor-Barge-Coach-Plugin-2.gif)

## Prerequisites

To deploy this plugin, you will need:

- An active Twilio account with Flex provisioned. Refer to the [Flex Quickstart](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project") to create one.
- npm version 5.0.0 or later installed (type `npm -v` in your terminal to check)
- Node.js version 10.12.0 or later installed (type `node -v` in your terminal to check)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and the [Serverless Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins). Run the following commands to install them:
  ```
  # Install the Twilio CLI
  npm install twilio-cli -g
  # Install the Serverless and Flex as Plugins
  twilio plugins:install @twilio-labs/plugin-serverless
  twilio plugins:install @twilio-labs/plugin-flex@beta
  ```
- A GitHub account

### Twilio Account Settings

Before we begin, we need to collect
all the config values we need to run this Flex plugin:

| Config&nbsp;Value | Description                                                                                                                                            |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                                   |
| Auth Token        | Used to create an API key for future CLI access to your Twilio Account - find this [in the Console](https://www.twilio.com/console).                   |
| Workspace SID     | Your Flex Task Assignment workspace SID - find this [in the Console TaskRouter Workspaces page](https://www.twilio.com/console/taskrouter/workspaces). |

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

Navigate to the primary plugin folder and run NPM install for the plugin
```bash
cd plugin-supervisor-barge-coach
npm install
```

Navigate to the serverless folder, create and modify the .env file
```bash
cd ..
cd serverless
***rename the .env.example file to .env and change the below:
ACCOUNT_SID= Found at https://www.twilio.com/console
AUTH_TOKEN= Found at https://www.twilio.com/console 
TWILIO_WORKSPACE_SID = WSXXXXXXXXXXXXXXXXXX
```

Run NPM install for the serverless functions
```bash
Run: (from the serverless directory)
npm install
```

Install the twilio plugin-serverless
```bash
Run: 
twilio plugins:install @twilio-labs/plugin-serverless
```

Deploy the serverless functions into Twilio
*Do this if you haven't deployed the serverless functions already*
```bash
Run: 
twilio serverless:deploy
```
Copy the domain as you'll need this for the .env in the next step


From the root plugin directory rename the .env.example file to .env and change the below:
```bash
cd ..
cd plugin-supervisor-barge-coach

var REACT_APP_SERVICE_BASE_URL = 
Points to the Twilio Function Service URL (example: https://barge-coach-XXXX-dev.twil.io)

Can be found by by going to https://www.twilio.com/console/functions/overview/services then click on barge-coach (should look like barge-coach-XXXX-dev.twil.io)

var REACT_APP_TASK-CHANNEL_SID =
Points to Voice Channel SID - Can be found by going to https://www.twilio.com/console/taskrouter/dashboard > click on Workspaces > then Task Channels
```

From the public folder, create the appConfig.js and change on variable within it
```bash
cd public
rename appConfig.example.js to appConfig.js

change serviceBaseUrl: "https://barge-coach-XXXX.twil.io"
```

## Development

In order to develop locally, you can use the Webpack Dev Server by running (from the root plugin directory):

```bash
Twilio flex:plugins:start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. If you want to change that you can do this by setting the `PORT` environment variable:

When you make changes to your code, the browser window will be automatically refreshed.

## Deploy

When you are ready to deploy your plugin, in your terminal run:
```
Run: 
twilio flex:plugins:deploy --major --changelog "Notes for this version" --description "Functionality of the plugin"
```
For more details on deploying your plugin, refer to the [deploying your plugin guide](https://www.twilio.com/docs/flex/plugins#deploying-your-plugin).

## View your plugin in the Plugins Dashboard

After running the suggested next step with a meaningful name and description, navigate to the [Plugins Dashboard](https://flex.twilio.com/admin/) to review your recently deployed and released plugin. Confirm that the latest version is enabled for your contact center.

You are all set to test chat and sms transfers on your Flex instance!


---

## Changelog

### 1.0.0

**May 4, 2021**

- Updated README - added changelog


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
