<a href="https://www.twilio.com">
<img src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg" alt="Twilio" width="250" />
</a>

# Notice - Legacy Code
This plugin is no longer maintained as of September 28, 2022. Supervisor Barge Coach has been migrated to the
[Twilio Professional Services - Flex Project Template](https://github.com/twilio-professional-services/twilio-proserv-flex-project-template).  Where supervisor Barge Coach has been updated to support both 1.X and 2.X Flex versions as features within the template.

# Twilio Flex Plugin - Supervisor Barge-In and Coach

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

This plugin adds a barge-in and coach button to the Monitor call canvas. You can get to this via the Team View, click on the agent you wish to monitor and the buttons will be available once you begin to monitor the live calls.  The left button is the Barge-In button which allows you to join the conference all with the agent(s) and customer(s).  Toggling this button will mute/unmute yourself.  The right button is the Coach button which allows you to talk to the agent you are monitoring.  The no other member of the call will be able to hear you except for the monitored agent.  Toggling this button enables Coach and the left button converts to a Mute/Un-Mute button for the coaching mode.

First select the call/worker you wish to monitor  
![Plugin Demo](https://github.com/twilio-professional-services/plugin-supervisor-barge-coach/blob/main/resources/Supervisor-Barge-Coach-Plugin-1.gif)

Click the Monitor button to enable the Barge-In Button (Middle Button) and the Coach Button (Right Button)  
![Plugin Demo](https://github.com/twilio-professional-services/plugin-supervisor-barge-coach/blob/main/resources/Supervisor-Barge-Coach-Plugin-2.gif)

As of the Version 2 Update to the plugin, there has been an addition of the Coach Status Panel to the Agent's UI.  This UI change can be enabled/disabled by the below button (as of Version 2.1 of this plugin)  
![Plugin Demo](https://github.com/twilio-professional-services/plugin-supervisor-barge-coach/blob/main/resources/Supervisor-Barge-Coach-Plugin-3.gif)

As of the Version 2.1 Update to the plugin, there is a private toggle to enable/disable the agent's ability to see who is coaching them  
![Plugin Demo](https://github.com/twilio-professional-services/plugin-supervisor-barge-coach/blob/main/resources/Supervisor-Barge-Coach-Plugin-4.gif)

## Requirements

To deploy this plugin, you will need:

- An active Twilio account with Flex provisioned. Refer to the [Flex Quickstart](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project") to create one.
- npm version 5.0.0 or later installed (type `npm -v` in your terminal to check)
- Node.js version 12 or later installed (type `node -v` in your terminal to check)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins) and the [Serverless Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins). Run the following commands to install them:
  
  ```bash
  # Install the Twilio CLI
  npm install twilio-cli -g
  # Install the Serverless and Flex as Plugins
  twilio plugins:install @twilio-labs/plugin-serverless
  twilio plugins:install @twilio-labs/plugin-flex
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

1. Clone this repo:

  ```bash
  https://github.com/twilio-professional-services/plugin-supervisor-barge-coach
  ```

2. Install the dependencies

  ```bash
  # Install the dependencies of the Flex Plugin
  npm install
  
  # Install the dependencies of the Twilio Functions
  cd functions
  npm install
  ```

3. Copy the `.env.example` file in the `functions/` directory:

  ```bash
  cp functions/.env.example functions/.env
  ```

4. Edit `.env`:

  ```bash
  ACCOUNT_SID= Found at https://www.twilio.com/console
  AUTH_TOKEN= Found at https://www.twilio.com/console 
  TWILIO_WORKSPACE_SID = WSXXXXXXXXXXXXXXXXXX
  ```

5. Copy the `.env.example` file in the root directory:

  ```bash
  cp .env.example .env
  ```

6. In a future step, once you have deployed your code, you'll get a domain for your Twilio Functions. Copy this and set the `REACT_APP_SERVICE_BASE_URL` in the `.env` file.

7. Copy the `public/appConfig.example.js` over:

  ```bash
  cp public/appConfig.example.js public/appConfig.js
  ```

## Development

In order to develop locally, you can use the Webpack Dev Server by running (from the root plugin directory):

  ```bash
  # Start Flex Plugins
  twilio flex:plugins:start
  
  # Start Twilio Functions
  cd functions && npm run start 
  ```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. If you want to change that you can do this by setting the `PORT` environment variable:

When you make changes to your code, the browser window will be automatically refreshed.

## Deploy

When you are ready to deploy your plugin, first deploy your Twilio Functions:

```bash
twilio serverless:deploy
```

*Note: Don't forget to copy over the domain to the root level .env - this only needs to be done once*

Then deploy your Flex Plugins

```bash
twilio flex:plugins:deploy --major --changelog "Notes for this version" --description "Functionality of the plugin"
```

For more details on deploying your plugin, refer to the [deploying your plugin guide](https://www.twilio.com/docs/flex/plugins#deploying-your-plugin).

## View your plugin in the Plugins Dashboard

After running the suggested next step with a meaningful name and description, navigate to the [Plugins Dashboard](https://flex.twilio.com/admin/) to review your recently deployed and released plugin. Confirm that the latest version is enabled for your contact center.

You are all set to test the Supervisor Barge/Coach features on your Flex instance!

---

## Changelog

### 2.2.0

**June 7, 2021**

- Updated Sync Doc with an array of Supervisors, coaching panel now supports an array of supervisors if multiple are coaching at the same time
- Optimized initSync function

### 2.1.0

**May 24, 2021**

- Added a Private Toggle to to the Supervisor UI to enable/disable the ability for the agent to see who is coaching them
- Fixed a minor bug when the coaching panel was rendering

### 2.0.0

**May 12, 2021**

- Added the Coach Status Panel to allow the agent to see who is coaching them (this leverages Sync Documents)
- Updated the Button Layout to be more user friendly (now has a Mute, Barge, and Coach button)

### 1.0.0

**May 4, 2021**

- Updated README - added changelog


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
