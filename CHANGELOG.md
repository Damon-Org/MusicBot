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

## 2020-05-27, Version v0.6.1 @Yimura

### Notable Changes

 * DJ commands have been moved to their own category
 * Fixed an old bug with argumentsSatisfied
 * Commands.json has been regenerated with the latest commands

### Commits

 * [**85403f4e7fe8a4626bb5d571b8e5007847a5324a**] Commands: Moved DJ commands to their own category
 * [**ae046fa21e2af27f0e6df7f4b4cae09f353851bd**] BaseCommand: Fixed old bug with argumentsSatisfied
 * [**9ba90cf7f13b6ab1469b2cc801215c0cef0758af**] Data: Added dj enable and disable commands

## 2020-05-27, Version v0.6.0 @Yimura

### Notable Changes

 * Commands will now be cloned instead of reusing the same instance for multiple requests, this would cause a number of problems where on of the most common was that class variables would be overwritten between async methods.
 * Different API's are now split into their own respective files
 * LavalinkTrack and SpotifyTrack class have been added to clearly differentiate between their different structures
 * A check was added to chose the most optimal way of handling a request
 * The hasRole method in UserUtils has been updated to support `<, >, <=, >=, =`
 * The permission system was extended support different levels of permission checking (ROLE, SERVER and COMMAND_HANDLED)
 * Voice Channel events have been extended, `onVoiceJoin` and `onVoiceLeave` have been added
 * An entire DJ system was added and all music commands will follow these permissions through `COMMAND_HANDLED`
 * An `equalizer` command was added
 * MusicSystem will now cache SpotifyTrack before playing a song
 * Fixed an old bug where removing the current song would prevent the next song from being played
 * `googleapis` dependency has been removed and replaced with `scrape-youtube`

### Commits (23)

 * [**20ff3d2f7a1ceb09bc57acdfdd84a62e3651697e**] API: Split all API's in different files and made a collection class
 * [**f45e1db4286bb85072a28841a8a715c582ff03a4**] MusicTracks: Made a difference between a LavalinkTrack and a SpotifyTrack
 * [**7caaa4d78c77e1c5e095450cb7e6d01de075140d**] EmbedUtils: Made embed utils more efficient
 * [**e43957d855b558896f7afb6a59e2c70b7d6e6d10**] MusicUtils: Added checkRequestType and made naming more consistent
 * [**a56ac242a7425c2b5433b77586ff0fc45a2db304**] UserUtils: Extended hasRole method functionality
 * [**04e00267f620323d468a306ed9ef9b49b552df18**] BaseCommand: Extended permission system, clone functionality, fixed bug related to beforeRun and afterRun
 * [**085b93d1a3aa38e55b408d4acfa1c93285e6d34c**] BotEvents: Expanded voice channel events to support joining and leaving
 * [**31f480006acf247ba53b49f45c87ea1476b535be**] BotMain: Moved API to central point of the code
 * [**27b399392a22fcea5779f47c6a4a08f647775536**] Commands: Added several DJCommands to managed queue access.
 * [**6bd8e0ad12c9de2ffcc9d5d44939dc7b6cdc7162**] MusicSystem: Added DJManager
 * [**867ebe733470e7abec544bb4e143bcb8b94ae67e**] Commands: Added dj and music extentions to BaseCommand
 * [**c9c1a4d3c16342ee1d0426b81897c8a0a887819e**] MusicTracks: removed original track class
 * [**3729a267fc21f361c75aa9e20c7e63c684532982**] ServerStruct: YouTubeAPI is now passed to a Choice class
 * [**3cd2e7469529c8418a4ef370bd8464870b9dda30**] Commands: added equalizer command
 * [**67e158090207f0a5098bcb9d96a68f0e43d3d289**] Commands: Optimised music commands
 * [**118e5606d2e495d01bada888685d07c3c11d52b7**] Commands: Modified commands to support cloning function
 * [**667b677b5e247ace440f28c31a3201bf7219bf83**] CommandRegistrar: Command instances are cloned now before execution
 * [**15bbfe4ef215d99e5bc5029372df237a32f3df62**] Choice: Updated choice class to support new track structures
 * [**b8c6ab148928eb1aa666878a351722ed8192c41d**] MusicSystem: Optimised code, Spotify tracks will be cached accordingly
 * [**cee88c9904426340e2d9949ff882deda9191f45f**] Data: Fixed bug where the bot couldn't mention people, updated intents
 * [**8089606cd18869ead9e3539a22404255b55d0da0**] Queue: Fixed bug where the currently playing song would be removed incorrectly
 * [**758bacf87247ee6154f6ca31e16fe85dbb71ffe4**] Data: Commands.json has been updated with DJCommands
 * [**1a45b5771e5f91be287297e004fe14e8e8f1f510**] Source: dependencies were updated and version bumped

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
