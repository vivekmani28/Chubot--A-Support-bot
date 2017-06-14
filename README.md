# Chubot

Chubot is a simple chat bot developed for Slack platform. It's primarily developed for programmers using REST-API calls. The technology stack includes node.js, postgreSQL, ansible and many more.

## Index

1. [The Problem & Solution](#problem)
2. [Primary Features & Screenshots](#primary)
3. [Our reflection on the development process and project](#reflect)
4. [Limitations and future work](#limit)
5. [Video Presentation](#video)

## <a name="problem"></a>The Problem & Solution

Often developers use REST API requests in their projects when interacting within a platform. For example, many use Github - REST API requests to interact with Github for their version control or source code management needs. Coding REST-API requests into large projects/automated processes requires referring lengthy pages of online documentation to find the proper code-syntax or to find definitions of headers/parameters used in the REST API requests. More importantly, this process is often redundant when developers write lots of similar API requests in their projects. Hence, this process is time consuming for developers and provides an opportunity for automation. 

Automating this process using a bot saves a lot of time and helps reduce developer frustration. This also frees the developer from opening many browser windows to refer documentation materials online, thereby clearing a lot of clutter on the developer’s desktop.

Chubot is a chat bot that assists it's users (software developers) by having conversations with them. Chubot has the following important functions:

  1. It automates the process of searching a platform's support documentation for a code-syntax (or) skeleton code of a REST-API operation/function.
  2. It finds definitions and explanations of REST API headers/parameters (Eg: JSON headers used in GET/POST methods). 
  3. It also sets required header values in the replies (node.js function code for a REST API operation), if specified by the user.
  
A developer can simply ask chubot for a specific REST-API request code and chubot will reply with a link to a Github gist containing the requested code in the form of a node.js function. Hence, chubot may be classified as a support bot.

## <a name="primary"></a>Primary Features & Screenshots

Chubot supports Github and Wordpress platforms as of version 1.0 and can be explanded into other REST-API compatible platforms in furture versions.

### Features

Chubot has three primary features:

  1. Saving a user's username, token and the API URL for a platform (currently Github & Wordpress).
  2. Generating a node.js function for a REST API request which is then posted as a Github gist.
  3. Providing definitions for headers/parameters used in REST API requests.

### Screenshots

#### Feature #1

![1](https://cloud.githubusercontent.com/assets/22831490/20863626/c63d6ee8-b99e-11e6-9101-b01f4e5ae2dd.GIF)

This screenshot shows chubot saving a user's Github and WordPress token. Later, chubot replaces the token values in the generated node.js functions (Feature #2) with this value. Similarly, the user can store their username and URL for every platform supported by chubot.

#### Feature #2

**PART 1: NO PARAMETERS IN REQUEST**

![2](https://cloud.githubusercontent.com/assets/22831490/20863627/c63db290-b99e-11e6-93a8-d93c95bd86bc.GIF)

This screenshot shows a user asking Chubot for the code to a function which can list all comments in WordPress. Chubot generates the function and posts it as a Github gist and then returns the URL of the gist to the user with a small preview of the function.

#### Gist containing the generated code

![5](https://cloud.githubusercontent.com/assets/22831490/20863684/d9611c02-b9a0-11e6-81dd-4de1dd632cf4.GIF)

**PART 2: MULTIPLE PARAMETERS IN REQUEST**

![3](https://cloud.githubusercontent.com/assets/22831490/20863628/c63e473c-b99e-11e6-919f-0c0d02fb1919.GIF)

This screenshot shows a user asking Chubot for the code to a function which can list issues in a Github repo. It should be noted that the user has passed values for two parameters in the GET request. This informs chubot to set the passed values to the appropriate headers/parameters when generatng the code for the node.js function. As earlier, chubot responds with the gist URL along with a small preview.


#### Gist containing the generated code

![6](https://cloud.githubusercontent.com/assets/22831490/20863685/d964f07a-b9a0-11e6-8c54-9d677ad5fc21.GIF)

It can be seen that Chubot has replaced the default value for `state` and `sort` parameters with the values that were passed in the user's request message.

#### Feature #3

![4](https://cloud.githubusercontent.com/assets/22831490/20863629/c63ea786-b99e-11e6-9e76-09160347fa19.GIF)

This screenshot shows a user asking Chubot to define the parameter `has_issues` and Chubot responding with the Name, Type and Definition of `has_issues`.

### <a name="reflect"></a>Our reflection on the development process and project

After finalizing the idea of developing a documentation-support bot, we narrowed our scope into three use cases (quoted above as features). We decided to use botkit framework to develop our bot and started working on the use cases. Initially we made certain that the bot ran without any issues when it was tested against mock data. Then, we started with the actual logical implementation where we used nodeJS to implement the core logic. Chubot performs storing and retrieving data most of the time and so, postgreSQL databases came in handy for this requirement. After configuring a database instance on heroku servers, we designed the tables that were required and populated values for them. Finally, for the deployment phase, we developed an ansible playbook that could remotely configure a server and install the required modules and packages for Chubot. We ran this playbook against a EC2 AWS instance and now Chubot is successfully running on that server.

The bot was initially designed to support REST API requests for the Github platform. After receiving suggestions that we could extend the scope of the problem, we included Wordpress API as well. This meant that the user could retrieve code snippets for creating, editing posts and media in WordPress. The botkit framework formed an integral part of the project. The user's query is parsed and depending on what the user requires, the bot forms a SQL statement which is then transacted against the database to retrieve information and display it to the user. 

One of the problems that we came across during Chubot development was on the choice of database. Initially we thought of using an Oracle SQL database. But, we weren't sure of how Oracle databases work with nodeJS. Later, while going through a list of some of the commonly used databases with nodeJS, we came across postgreSQL. It was also a SQL database hence it was easier on the learning curve. This also worked well with heroku service, which provided a postgreSQL database instance as a service. Thus, we had a database instance which was running all time that could interact with a nodeJS application seamlessly.

This project helped us understand the various phases that are involved in developing an application and the possible problems that may arise while developing it. These also include the consideration of the compatibility of different phases in the development process. For example, how nodeJS supports postGreSQL databases, Heroku database instances, Ansible playbook and EC2 AWS instances. The stage-by-stage completion of the project helped us realize how any problem should be broken down into smaller sub-problems and then be built upon one stage at a time. By improving the scale of the project, we came to realize that bots can be developed to solve many relevant problems: through coding easier and faster.

### <a name="limit"></a>Limitations and future work

One limitation is that Chubot doesn't verify the validity of the token provided by the user. It simply accepts the token values specified by the user and replaces it with the default values in it's code generation process.

Currently Chubot (v1.0) supports REST API requests in Github and WordPress only. Future work can be focused on including support for other REST API compatible platforms. This can be done **without modifying** chubot's implementation (code) and **just adding** required documentation records in the database.

Lastly, there is one more area that could be addressed in the future and that is the storage of skeleton code (used in the function code generation process) in the database. Currently the skeleton code for each function is directly inserted into the database (for each REST API request) and they are not dynamically generated although the parameters alone are dynamically modified. In the future, Chubot can be programmed to include artificial intelligence methods to support this feature. Addition of one or more database tables may be needed for mapping each REST API request to it's parameters and this should be sufficient to allow complete dynamic code generation.

### <a name="video"></a>Video Presentation

[Here](https://www.youtube.com/watch?v=fkMhdPeGPh8) is a link to the video presentation, demonstrating the three usecases.
