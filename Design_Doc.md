# Design Document (Chubot)

## Index

1. [Problem Statement](#problem)
2. [Bot Description](#description)
3. [Design Sketches](#sketches)
4. [Architecture Design](#arch)
5. [Additional Patterns](#additional)


## <a name="problem"></a>Problem Statement
For many software developers, Github remains the most popular distributed version control and source code management system. Developers often use Github - REST API requests to interact with Github for their version control or source code management needs. Writing these API requests may require them to refer lengthy pages of online documentation to find code-syntax or, to find definitions and descriptions/explanations for header/parameter values used in the code of REST API operations. This process of going through pages of documentation is time consuming for developers and is very much automatable. More importantly, this process is often redundant when developers write lots of similar API calls in their program code. 

## <a name="description"></a>Bot Description
Chubot is a chat bot and assists the users (software developers) by having conversations with them. Chubot has two important functions:

1.	It automates the process of searching Github’s support documentation for a code-syntax (or) skeleton code of a REST-API operation
2.	It finds definitions and explanations of Github’s REST API headers/parameters (Eg: JSON headers used in GET/POST methods). 
In addition to the above functions, chubot can also (optionally) set required header values in REST-API requests, if specified by the user.

A developer can simply ask chubot for a specific REST-API code-syntax or for an explanation of a specific header in an API request and chubot will reply with the requested material. Since the above processes are manually done by developers many times (redundantly) when writing code, automating these processes using a bot saves the developer a lot of time and frustration. Having a bot do this task also frees the developer from opening up many browser windows to refer documentation materials online, thereby clearing a lot of clutter on the developer’s desktop. Since chubot assists a developer by automating searches through supporting documentation, it may be classified as a support bot and a search bot.  

## <a name="sketches"></a>Design Sketches
### Wireframe Mockup

![Wireframe screenshot](https://media.github.ncsu.edu/user/5816/files/86d08c78-8103-11e6-9677-dea8c5812ddb)

### Storyboard
![Storyboard picture](https://media.github.ncsu.edu/user/5816/files/f58f9e12-811a-11e6-9dbb-c263ad3088b4)

##<a name="arch"></a>Architecture Design

![arch_diagram](https://media.github.ncsu.edu/user/5810/files/f4922364-80c9-11e6-935a-3d6432decf8b)

###Component Descriptions:

**Chat GUI**

This is a simple slack chat component through which the user will be able to interact with the application. Data that is retrieved for the user’s query are displayed here. This GUI also displays the list of actions that could be performed by chubot whenever a conversation commences. 

**Sender/Receiver**

This component receives the user’s query through the Chat GUI component and sends it down to the parser. It also returns the output (REST API request's code snippet/header description) of the query to the chat GUI component which then displays it to the user.

**Input Parser**

Input parser parses the user’s query and looks for keywords in them. Based on the keywords, it identifies which of the two search engines should the data be passed. 

**API Search Engine**

This search engine queries the database to retrieve the required code snippet(REST API request). Additionally, if the user has given specific values for any of the headers in the REST API's request, this component replaces the default values for those headers with the one’s specified in the user's input. Finally it returns the snippet back to sender/receiver's component. 

**Description Search Engine**

This component interacts with the Oracle database. This search engine queries the database to retrieve the description for the request-header, which was specifed by the input parser component. 

**Oracle Database**

Database stores two types of data:

1. Code-syntax for Github's REST API's request(with default values).

2. Definitions/Descriptions for all headers that are used in the REST API's request.

###Constraints/Guidelines
•	Chubot must be implemented using slack API.

•	If Github changes the documentation for the REST APIs in future, the same should be manually reflected in the database to provide the user with accurate results, as the bot basically searches for the snippets in the database.

•	The bot can neither send nor share data from one user to another.


##<a name="additional"></a>Additional Patterns

**Pipe and Filter – Data Flow Architecture Pattern**
![image](https://media.github.ncsu.edu/user/5810/files/9530bd96-80f0-11e6-99d1-dac566995944)

In Chubot, the data is required to be passed from one component to another. Basically, the parser gets the user’s query in plain text format, filters the data that is received and will look out for keywords. Based on these keywords, the control is passed on to one of the two search engines. The output from the search engine is passed on to the GUI, through the Sender/Receiver component. The functionality of the parser is similar to a 'filter' and the transfer of data from one component to another is similar to 'pipes'. Hence, "Pipe and Filter Design pattern" can be applicable to Chubot.

**Main program and Sub program - Call and Return Architecture Pattern**

ChuBot is the main program that contains 2 sub-routines getSyntax(), getDef(). Depending on what the user wants from the bot, the corresponding sub-routine is implemented. Once the user calls getSyntax(), he may ask the bot information about the headers used. Here, sub-routine 1.1 is called. This way, the program is said to exhibit "Call and Return architectural pattern - Main program and subprogram".

**Batch Sequential - Data Flow Architecture Pattern**

Batch sequential design pattern can be applicable in the case of ChuBot program. First, the user asks the bot to retrieve information about a particular REST API request. The commands are sent to the parser which reads the input and then uses the search engine to find the given REST API request. The code is then retrieved from the database and displayed to the user in the ChuBot GUI, through Sender/Receiver component.

## Actions Improved

1. **Simplifying interaction with the bot:**
Instead of using complex free-form text while interacting with chubot, the users could directly type in the command (VERB or VERB/URL) for which he/she requires the code snippet. For example, instead of typing in "Give me the code snippet to list all github repos", users should type "GET /user/repos". Here the VERB is "GET" and URL is "/user/repos". If there are any parameters that needs to be set in the snippet, those parameters can be added to the URL. For example,  "GET /user/repos?has_issues=true&private=true". This simplifies the interaction between users and chubot.

2. **Expanding to another API beyond GitHub:**
The design (which initially worked only with Github API) has now been expanded to the WordPress API as well. Wordpress uses a REST API to enable interaction with other applications. For example, the various actions that can be performed on wordpress pages are: List Pages, Retrieve Pages, Create Pages, Update Pages & Delete Pages. With Wordpress Media, we can: list, create, retrieve and delete media content. Other operations include Posting Revisions, Listing, Retrieving and Deleting Post Revisions. All these operations are done using the same (VERB/URL) command, as described earlier. The user can now ask chubot for descriptions & syntax of WordPress API requests along with GitHub API requests.


3. **Posting code as gists:**
In the original proposal Chubot had to directly print out the code snippet (for a REST API request) when replying to a user's command. This design has been modified and the code snippets are now returned as gists instead. Chubot will respond to the user's query with a gist URL, and the user can then obtain the code snippet by clicking on the provided gist URL. Thus, even for a long code snippet, chubot would just return a gist URL, keeping the conversation precise and simple. 


## Updated Wireframe Mockup showing new interaction pattern with Chubot

![chubot_new](https://media.github.ncsu.edu/user/5816/files/0c2ce746-96e3-11e6-9157-3f52e10f9108)