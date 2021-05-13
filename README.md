<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Twilio Flex Plugin - Supervisor Barge-In and Coach

The Flex Supervisor Barge-In and Coach plugin allows contact center supervisors to barge in and coach agents while they are on a live call. This plugin adds two buttons for barging in and coachingto the Flex UI. Within Teams View, you can click on the agent you wish to monitor and the buttons will be available once you begin to monitor the live calls. 

## How it works

The Barge-In button on the left allows you to join the conference with the agent(s) and customer(s). You can toggle the button to mute and unmute yourself.  The Coach button on the right allows you to **only** talk to the agent you are monitoring, leaving the customer out of the coaching segment of the call. Toggling this button enables Coach and the left button converts to a Mute/Un-Mute button for the coaching mode.

First, select the agent whose call you wish to monitor.

![Plugin Demo](https://github.com/aestellwag/plugin-supervisor-barge-coach/blob/main/Supervisor-Barge-Coach-Plugin-1.gif)

Click the Monitor button to enable the Barge-In Button (Middle Button) and the Coach Button (Right Button).
![Plugin Demo](https://github.com/aestellwag/plugin-supervisor-barge-coach/blob/main/Supervisor-Barge-Coach-Plugin-2.gif)

As of the Version 2 Update to the plugin, a Coach Status Panel can be enabled for the Agent Desktop.  When enabled, an agent will see the Supervisor who is coaching them.  This can be set within the `BargeCoachState.js` file in the `src/states` dsubdirectory of the repository.

![Plugin Demo](https://github.com/aestellwag/plugin-supervisor-barge-coach/blob/main/Supervisor-Barge-Coach-Plugin-3.gif)

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

Navigate to the root directory and run the following:
```bash
cd plugin-supervisor-barge-coach
npm install
```

Navigate to the `serverless` folder, rename `env.example` to `.env` and modify with your Twilio account details.
```bash
cd ..
cd serverless
***rename the .env.example file to .env and change the below:
ACCOUNT_SID= Found at https://www.twilio.com/console
AUTH_TOKEN= Found at https://www.twilio.com/console 
TWILIO_WORKSPACE_SID = WSXXXXXXXXXXXXXXXXXX
```

Install the function package dependencies:
```bash
serverless $ npm install
```

Deploy the serverless functions to your Twilio account.
```bash
Run: 
twilio serverless:deploy
```
Copy the domain as you'll need this for the `.env` in the next step.


From the root directory of your plugin copy, rename `.env.example` to `.env` and modify the variable with the domain name you've copied in the previous step:
```bash
cd ..
cd plugin-supervisor-barge-coach
var REACT_APP_SERVICE_BASE_URL = https://barge-coach-XXXX-dev.twil.io
var REACT_APP_TASK-CHANNEL_SID = TCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

In the Twilio Console, you can navigate to the [Services Page](https://www.twilio.com/console/functions/overview/services) and  then click on the barge-coach link. You should find the Function domain name under **Settings**. To find the Task Channel SID for Voice, navigate to [TaskRouter Dashboard > Workspaces > "Flex Task Assignment > Task Channels](https://www.twilio.com/console/taskrouter/dashboard).
```

From the public subdirectory, rename `appConfig.example.js` to `appConfig.js` and update `serviceBaseUrl` with your Functions domain.
```bash
cd public
mv appConfig.example.js to appConfig.js

serviceBaseUrl: "https://barge-coach-XXXX.twil.io"
```

If you wish to enable or disable the Coach Status Panel, open `src/states/BargeCoachState.js` and update the `coachingStatusPanel` variable:
```bash
plugin-supervisor-barge-coach $ cd src/states
// Toggle coachingStatusPanel feature - the ability for the agent to see who is coaching them
// true = enabled, false = disabled
coachingStatusPanel: XXXXX
```

## Development

In order to develop locally, you can use the Webpack Dev Server by running (from the root plugin directory):

```bash
twilio flex:plugins:start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. If you want to change that, you can set the `PORT` environment variable to a different value.

When you make changes to your code, the browser window will be automatically refreshed.

## Deploy

When you are ready to deploy your plugin, run the following from the command line:
```
Run: 
twilio flex:plugins:deploy --major --changelog "Notes for this version" --description "Functionality of the plugin"
```
For more details on deploying your plugin, refer to the [plugin deployment guide](https://www.twilio.com/docs/flex/plugins#deploying-your-plugin).

## View your plugin in the Plugins Dashboard

After running the suggested next step with a meaningful name and description, navigate to the [Plugins Dashboard](https://flex.twilio.com/admin/) to review your recently deployed and released plugin. Confirm that the latest version is enabled for your contact center.

You are all set to test the Supervisor Barge/Coach features on your Flex instance!

---

## Changelog

### 2.0.0

**May 12, 2021**

- Added the Coach Status Panel to allow the agent to see who is coaching them. This functionality leverages Sync Documents.
- Updated the Button Layout to be more user-friendly (now includes the Mute, Barge, and Coach buttons).

### 1.0.0

**May 4, 2021**

- Updated README - added changelog


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
