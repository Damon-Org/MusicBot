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

## 2020-05-22, Version v0.5.7 @Yimura

### Notable Changes

 * An ignore condition was added for error logging on the top level
 * Fixed a bug that would allow playlist without songs in it to be queued
 * Fixed a bug with send message shorthands in BaseCommand
 * An emergency reset command was added

### Commits

 * [**26563aff8069aee83dcdf7c0cb8d955976b0adc0**] Source: Added ignore condition on error logging
 * [**0637c1084613e619cc1dd47468667a3ee25f8081**] MusicCommand: Fixed bug that would allow playlists to be found without songs in them
 * [**b3a53818364c23bb5582cb491fb92e356d106187**] BaseCommand: Fixed bugs to Message send shorthands
 * [**4a7f273f2acc3012b5f42708016aca7929123444**] MusicUtils: Updated comments and fixed bug with playlist adding
 * [**0f1100ec9f342bdcb44d303a596fcec4a0281df8**] MusicSystem: Attempt was made a force removing player objects
 * [**76d4ee027438a9d20fa5d55c21a129f0dee5d80f**] MusicShutdown: Optimised code flow
 * [**e293918ccb1ac0daffa9599f02afcfa416daf61b**] MusicSystem: Fixed variable typo
 * [**40202f67673f3240b7703857502635c7ce6205b5**] Commands: Added emergency reset command

## 2020-05-08, Version v0.5.6 @Yimura

### Notable Changes

 * Added `reverse` command
 * Fixed undefined serverInstance in `skipto` command
 * The bot will now reuse its old message object to prevent spam (as long as the lastMsg was from the bot)
 * Queue top limit will now be enforced

### Commits

 * [**cb7ed342aa77dcf8fabee6dcb0a44228847cfd50**] Commands: Generated commands.json with reverse command and fixed typo in reverse command
 * [**bd329f0fae69b22e84b2f409bf10dc1a1e85d48c**] Commands: Fixed undefined serverInstance in skipto command
 * [**2169170f89a76e981ccac109ffdb8245643908a9**] MusicSystem: Made it so there's less chat spam, reusing the old message object
 * [**35d379d9ab97ead2b5c9e56c8bb4441bc4775854**] Queue: The queue will now check if the top limit is hit
 * [**184d0710ee3007f71e481c39d5ebef308daec728**] MusicSystem: The system will now handle if the max queue limit is hit
 * [**541be6c97b3ae8595070dba098113ef52a571877**] MusicUtil: Added extra interactive message to notify that the queue limit has been hit
 * [**14da9d9e5a4ba25914249b5e45dce4d11491066c**] MusicUtils: Queue limit message shows the dynamic limit instead of a hardcoded value

## 2020-05-07, Version v0.5.5 @Yimura

### Notable Changes

 * Changed BasicCommand name to BaseCommand to better reflect what it is
 * Fixed a bug where commands could no longer run in DM's
 * The lazyloader from Soft & Wet was included in Damon to prevent future load
 * A utility folder was created with several helpful scripts for setting up Damon
    * Service installation script
    * IPv6 setup was added
 * Fixed several problems with the queue shuffle command
 * Added `loop` alias for the repeat command

### Commits

 * [**9196377a1d4a319b9c8240b152b8b7539a7417b3**] & [**c3de9cfc5a240611e08181fa908b1157aa72ec1e**] Source: Slight restructure
 * [**6b5d3ae32ff13500f51cba2a143cf492ab51e5ca**] Core: Fixed commands to be able to run in DM's
 * [**f09cc1a8280994277efd3873c593154fb69f861e**] & [**4a380bd9e2f092d6d8ac99904541819b81410145**] Core: Added lazyloader to prevent future high database load
 * [**c729688013e404595b1df4aaa55068b9153f8c5b**] Core: More extensive logging on command execution
 * [**cf83697f22c9415e6b622eac242dacb9a067bf45**] Util: Created util folder, moved scripts to `util/`, added IPv6 setup script
 * [**c2f289a7b14a889983a8108d2313e645236d2e92**] Util: Added service installation script
 * [**1661a1cefd5e9e0d7cd53f104da2d878b30eb173**] Util: Added check if ndppd has been setup before
 * [**a6d0671114a4aff016b1505d91697250f07eca4e**] MusicSystem: Fixed shuffle method and start getter of queue
 * [**44f98468d7abe6ba84b452cbbd5a5b1ff803d9a7**] Commands: Added another alias for repeat

## 2020-05-01, Version v0.5.4 @Yimura

### Notable Changes

 * The bot will properly cleanup the musicsystem if force disconnected from a channel
 * A shutdown manager was added to make it easier to stop the music system on a delay or instant
 * Minor performance improvements were done
 * Guild only commands are now properly working
 * Installation script was added

### Commits

 * [**41e0c7d1c5a7db21e495bba9fef5fd2b669599d8**] & [**e7d4c2098934209f50eb852fafc54052415708b8**] Added `guild_only` key to several commands and commands.json
 * [**d2d46529cff21c7d4a190c40973c58fd49af83a8**] Shutdown manager was added and code cleanup
 * [**2c154900710740cb7505d25caffa3dcc08b25d15**] Message check load was reduced
 * [**05037649eff5f232cf1ed04a7e2d5b3e699dfce2**] Fixed command category lock to a channel
 * [**ac5031538ef211177bdef231c1a14527de952474**] Added installation script
 * [**e8ca3274b219dc64bc7cf5a7160e5bb109af3513**] The bot will do a proper cleanup when force disconnected

## 2020-04-22, Version v0.5.3 @Yimura

### Notable Changes

 * Bot will now wait 5 minutes before leaving and destroying a queue (when a user has left or a queue just ended)
 * Change command documentation structure slightly for example usage
 * Fixed an old bug in the remove song command
 * Queue command was fixed for several edge cases
 * Bot will react to several commands instead of replying for better user interaction

### Commits

 * [**55873870e5dc7fbe5a8e2263c494531b25063a46**] Fixed old bug in removesong command, made example to single string in each command
 * [**9d1e4f17ba7e19e890dc23e8d1e4674d1704f7d4**] Added several extra interactive elements, bot will not leave immediatly after ending the queue
 * [**b0570e20b5dc9382b47e120a5319b9296b00560d**] Fixed queue command

## 2020-04-18, Version v0.5.2 @Yimura

### Notable Changes

 * Disabled recording commands, horribly broken anyways right now
 * Updated config.json to add more accurate intents
 * Added songs_playing key to the "info" SocketEvent
 * Added looking for request message when doing track lookup's

### Commits

 * [**4663a90261818a2dec75dbeae8009e33deea80c1**] Updated config.json (the commit says command.json but that's a typo)
 * [**42828fe47dac7bc4bcf6e2aa37852bc9af832770**] Disabled recording commands
 * [**1604a1569930ce7778429d4358b68f69412348ae**] Added songs_playing key to info socket event
 * [**61bba64f3a4bf36e46da9ec54427295766d605a5**] Added looking for request message when doing track lookups

## 2020-04-16, Version v0.5.1 @Yimura

### Notable Changes

 * Fixed bug with SocketCommunication
 * Fixed bug where guild count would show **undefined**
 * Attempt at fixing queue out of sync queue and multiple songs starting at once
 * Structure change
 * Client options have been added together with gateway intents
 * Added shuffle command

### Commits

 * [**759d24a64f93c430e374747b794f1be121725b97**] Small bug in SocketEvent
 * [**52fbbbe04fc99562b76189d22b2fd9e74fbeba1c**] Slight structure change, bug fixes
 * [**a368beb1fc891eaca930a6ecd7f1083feb2e8838**] Attempt at fixing queue out of sync queue and multiple songs starting at once
 * [**this_commit**] Added shuffle command

## 2020-03-30, Version v0.5.0 @Yimura

### Notable Changes

 * Switched Damon Music to the new command handler
 * `commands.json` will now be generated on after command mapping succeeded.
 * Requires were cleaned up and json loading is now handled by require instead of using fs to load this file
 * Dynamic presence has been added

### Commits

 * [**759d24a64f93c430e374747b794f1be121725b97**] Total revamp of Damon Music so it supports the new command system

## 2020-03-03, Version v0.4.7 @Yimura

### Notable Changes

 * Fixed bug specific to playnext command
 * Added calllink command
 * Fixed bug where bot would think he's in a voice channel after leaving due to the reset not happening
 * Fixed bug where reacting to a choice embed would add a song twice

### Commits

 * [**816fbcb42e32a8bcd7280fcb170772206d7702c1**] Fixed bug specific to playnext command
 * [**2e46795ae786e25768be8ccf07c63ea211275aec**] and [**c33fbab09b0f8c1daab47d77218a749357adb935**] Added calllink command
 * [**769b5aa1674a675e34f70524e9a0119685b75aa8**] Bug fix related to leave command leaving the voicechannel
 * [**274235ee2c0016cbd80d55d2e74cd49131a391e7**] Fixed bug where reacting to a choice embed would add a song twice

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
