# Damon Music Changelog

## Versioning Policy

Following:
**major.minor.patch**

* **major** is almost never used unless a complete rewrite happened of Damon Music
* **minor** used whenever a single file was rewritten or significant change happened
* **patch** may only be bumped after a bug was resolved as whole

Following (beta):
**0.major.minor/patch**

Major versions starting with a **0** will have **minor** interpreted as major's and a bump of this number will be seen as a total rewrite

## 2020-02-20, Version v0.4.6 @Yimura

### Notable Changes

 * Rewrite of BasicCommand class (previously just called Command "src/util/command.js"), this rewrite has improved efficiency and possibly saves up to 50 lines of code in certain commands
 * Fixed fatal bug that would only allow users with system level permission lower than 2 unable to use it

### Commits

 * [**e528bc56846b5f560e3ce10a1299c6065e983f51**] Rewrite of BasicCommand class (previously just called Command)
 * [**a762fa7a0cc16233e87424f69df14fc17a31ae19**] Fixed fatal bug that would only allow users with system level permission lower than 2 unable to use it

## 2020-02-18, Version v0.4.5 @Yimura

### Notable Changes

 * Added event based socket communication
 * Fixed old error logging being broken, TO-DO from v0.4.3 was resolved this way
 * A shard in production should attempt to respawn, development bot should be stable before releasing
 * SocketMessages of type part are now supported

### Commits

 * [**f483447560a7f02fba7137cdc386d748d5688315**] Added event based socket communication
 * [**deec2d921f0d5e940d749891f0ab25eab634b0f9**] SocketMessages of type part are now supported


### TO-DO

 * ~~Add support for messages of type "part"~~

## 2020-02-16, Version v0.4.4 @Yimura

### Notable Changes

 * Fixed typo where the bot was unable to get the default production prefix
 * Renamed lib folder to src as lib should be reserved for 3rd party sources

### Commits

 * [**32747a1f999843c159a3751a7b93f6f495ba30fa**] Fixed typo where the bot was unable to get the default production prefix
 * [**e528bc56846b5f560e3ce10a1299c6065e983f51**] Renamed lib folder to src as lib should be reserved for 3rd party sources
 * [**0f287fda96b11e4a314e850688b4d0b8dbb9b4c5**] Fixed bug where rawData was missing in the Choice class, was removed by accident

## 2020-02-15, Version v0.4.3 @Yimura

### Notable Changes

 * Modified all module exported files to support documentation generation better
 * Added JSDoc configuration file
 * Enhanced inline code documentation
 * All commands now extend a basic command to reduce duplicate code
 * Added proper documentation support
 * Generated documentation is included in source code
 * Added authentication file which differentiates between production development
 * Remove old console.log

### Commits

 * [**87578b08b4f053feb85c31192d7ed2994b88a6e7**] Added basic command class, updated inline code documentation, bumped project version
 * [**e788f0ceffded2a3752b4810f374e57196b1608d**] Documentation support has been added, generated documentation is included with source code
 * [**e685b26497ffc60a690d15517c51156cab02bd21**] Added authentication file which differentiates between production development

### TO-DO

 * ~~Add proper catch all error logging to the bot~~

## 2020-02-13, Version v0.4.2 @Yimura

### Notable Changes

 * Added skipTo command
 * Fixed bug where remove command would show the old command prefix
 * Fixed bug where remove command would say it had successfully removed a song while in fact it has silently failed
 * Added better visible yesNoOptions
 * Fixed queue command not working with negative pages
 * Playlist handling now accounts for urls that do not contain a YT Video ID
 * Fixed fatal error which would crash the entire bot

### Commits

 * [**57c685fc6d96bbe110df6b9b0ada450d511ff2a3**] Added skipTo command, fixed two bugs in remove command
 * [**bb12ad846d1e54f0a479bc312813d49156ad95a4**] Added better visible yesNoOptions, fixed queue command not working with negative pages
 * [**242a68885bb088bb529b46fb52b85fe852a6ce87**] Playlist handling now accounts for urls that do not contain a YT Video ID
 * [**2d844dca5f9bca6b3e44aab792e3299738a9e66b**] Fixed fatal error that would crash the entire bot

## 2020-02-12, Version v0.4.1 @Yimura

### Notable Changes

 * Playlist support was added for all the supported Lavalink sources
 * Code for adding to the queue and creating a new queue was cleaned up and moved into a general function
 * Bugs were squashed related to adding a song to the queue that contained a list id
 * Added presence rotation
 * Added version in source code

### Commits

 * [**38516db2d297c13c8790a0395d049c7850f2fabf**] Playlist support and cleanup of code
 * [**38516db2d297c13c8790a0395d049c7850f2fabf**] Presence rotation was added
 * [**38516db2d297c13c8790a0395d049c7850f2fabf**] Added version in source code

## 2019-12-30 to 2020-02-11, Version v0.4.0 @Yimura

### Notable Changes

  * Discord.js was updated from v11 to v12 with all the notable changes to the files following
  * Music System was rewritten to use Lavalink instead of ytdl-core and soundcloud
  * Code for reacting to a message was cleaned up
  * Moved all authentication information to a configuration file
  * The entire project was also made to be no longer reliant of an absolute path
  * RecordingSystem was implemented (unusable until a service is setup which allows for these files to be downloadable)
  * Removed redundant code prior to the Lavalink implementation
  * Fixed problems where MusicSystem would say that it has started playing music while in fact it ran into an error

### Commits

  * [**ac30b694923fbe2f162e7499ebe5dafa256357b2**] Rewrite of Damon Music
  * [**14723026c7faf34d6ce976c212178802a448d14f**] Configuration file was added
  * [**8cf5ca2f0d814856d34df6233d25d1a19917e9df**] Fixed MusicSystem to be properly reset if the queue did not start
  * [**ac6af0b9085c8258125a70b593496b17f613808f**] Fixed repeat command not properly working whereas the repeat reaction did work
  * [**8cf5ca2f0d814856d34df6233d25d1a19917e9df**] Fixed bug where bot wouldn't leave the voice channel if he were the last
  * [**21c2bd539614adc71fefd918a0a7d7ea0d0a069d**] Fixed where the default of the lock command would reset the lock instead of take the channel id as default

## 2019-12-29, Version v0.3.0, @Yimura

### Changelogs prior to this point were not recorded.
