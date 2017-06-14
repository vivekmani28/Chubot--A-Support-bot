# Usecases (Chubot)

## Index

1. [Use-Case Description](#usecase)
	* [Use Case #1](#usecase1)
	* [Use Case #2](#usecase2)
	* [Use Case #3](#usecase3)

## <a name="usecase"></a>Use-Case Description

### <a name="usecase1"></a> Use case 1 - Setting and getting tokens, URL and usernames

```
Use Case: Setting and getting tokens, URL and usernames
1 Preconditions
   Chubot must be running in Slack platform.
2 Main Flow
   User will specify the 'set' [S1] or 'get' [S3] request type, provide the platform name (currently Github or Wordpress only), specify the type of parameter (token/URL/username) and finally specify it's value. Chubot will store [S2] or retrieve [S4] the value of parameter in the respective platform.
3 Subflows
  [S1] User provides 'set' command with 'PLATFORM_NAME', 'PARAMETER_TYPE' and 'VALUE'.
  [S2] Bot will set the 'VALUE' to 'PARAMETER_TYPE' in 'PLATFORM'.
  [S3] User provides 'get' command with 'PLATFORM_NAME' and 'PARAMETER_TYPE'
  [S4] Bot will get the 'VALUE' of 'PARAMETER_TYPE' in 'PLATFORM'.
4 Alternative Flows
  [E1] User sets the value of any parameter as 'null'.
  [E2] User specifies a platform name other than 'Github' or 'Wordpress'.

```
### <a name="usecase2"></a> Use case 2 - Returning a REST-API code snippet

```
Use Case: Returning a REST-API code snippet
1 Preconditions
    User has already set their tokens, URL and usernames.
2 Main Flow
    User will request code snippet by providing a REST command [S1]. Chubot inspects the commmand for parameters [S2][S5]. Chubot searches the database and returns the code-snippet [S3][S6].
3 Subflows
    [S1] User provides HTTP request type (GET/POST/CREATE/DELETE) command with the URL.
    [S2] If there are any parameters in the HTTP request, bot stores their value.
    [S3] Bot searches the database and retrieves the corresponding code snippet using the supplied HTTP request type [S1][S2] as the key. 
    [S4] If the API token/URL/username is already available (Usecase 1), chubot updates the respective parameter values in the code snippet returned.
    [S5] If there are any user-defined values for other parameters, bot replaces the default value with the user-defined value.
    [S6] Chubot posts the retrieved code snippet as a gist and provides a URL to the user.
4 Alternative flow
    [E1] Unsupported HTTP request type is sent to chubot.

```
### <a name="usecase3"></a> Use case 3 - Defining parameters in REST API requests

```
Use Case: Defining parameters in REST API requests
1 Preconditions
 	Chubot must be running in Slack platform.
2 Main Flow
 	User will request the definition for parameters in REST API requests [S1]. Chubot will provide the corresponding definitions, by retrieving it from the database [S2].
3 Subflows
	[S1] User provides 'define' command with the parameter name.
	[S2] Bot searches the database and retrieves the definition of the parameter.
4 Alternative Flows
	[E1] The parameter name supplied is incorrect.