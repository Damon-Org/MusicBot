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

## 2021-08-18, Version v1.0.2

### Notable Changes

 * MusicSystem max queue has been bumped to 500.
 * Fixed some typos in MusicSystem

## 2021-08-18, Version 1.0.1

### Notable Changes

 * Forgot to add servers to the database when the bot joined them.

## 2021-08-17, Version 1.0.0

### Notable Changes

 * Support for Deezer has been added
 * You can now queue the top 10 tracks of an artist from Spotify
 * Bumped queue max length from 300 to 500
 * Reliability improvements

## 2020-09-08, Version v0.7.3 (**7e23c094356f7a3d64b99b603a5f10dfe7f4bbf3**)

### Notable Changes

 * Support for Spotify playlists over 100 tracks
 * If the bot is running in development mode, default to the development prefix regardless of if a custom is set
 * PlayerEmbed song thumbnail has been fixed
 * Slimmed down some code in MusicSystem and fixed TrackStuckEvent causing the player to stop

### Commits

 * [**47b2f1c2f5e4977d554ddabd2a78f42cacca4eac**] MusicSystem: Indent
 * [**c426700a1dca684f2047985bbe66e76846058f41**] Data: changed websocket host in auth
 * [**14e1ef96219d57fd39524de40df3cfeb16e20d82**] DJMode: Added MODE import
 * [**9cdb839fd468b5e6184cebc50603e87acb8d3071**] MusicCommands: Changed extend from BaseCommand to DJCommand
 * [**9577274a3672fc7553538d897b52853867fcb606**] MusicCommands: Changed extend from BaseCommand to DJCommand
 * [**d8aebbab751f95751e80496208be685da751a625**] DJAdd: Added recommendations from Akke
 * [**59bec1c529159f60d493829e8b5a575b71bbeaa9**] Data: Development false and intents have been changed
 * [**8e11215028ff9b4064782f4eeda9e572ecbd7a78**] Music: Minor comment changes
 * [**00232ffeb8092a311f85c441acec7b6a12b98fa9**] WSEvent: Added uptime entry
 * [**4212d34cf750d5bc62ad453c0aa9af2cd67bbaaa**] Merge branch 'master' of https://git.damon.sh/damon/music into master
 * [**a2258e5630df42cc7d7c72ec237d779cd711d291**] CommandRegistrar: In development mode the bot will force use the default prefix
 * [**7e23c094356f7a3d64b99b603a5f10dfe7f4bbf3**] SpotifyAPI: Added support for playlists longer than 100 tracks.

## 2020-07-26, Version v0.7.2 (**3b046d4a727c369ede08c2bf1740e30afccfe328**)

### Notable Changes

 * Fixed imports in DJList command and ReactionListeners module

### Commits

 * [**c9f840e0b2209a392613a8bb3cd4597f23bdfe29**] DJList: Fixed import
 * [**3b046d4a727c369ede08c2bf1740e30afccfe328**] ReactionListeners: Fixed import path

## 2020-07-26, Version v0.7.1 (**481d46fe83058102b0310b69a83601d4c1ef6a6f**)

### Notable Changes

 * Fixed a problem that would create too many connections to the MySQL server
 * Imported MODE in ReactionListeners module so reacting works in guilds that have DJ mode activated
 * Fixed a problem with SetPrefix that would set the default prefix instead of the given custom one
 * Fixed music undefined error in DJList command

### Commits

 * [**607a3717033aa0a0b4d65debcbdce97932af34e7**] Merge: Upstream fixed async await addGuild method
 * [**7bef06ddc30dcdb178d82187fc2ac4b61211c6e3**] ServerOptions: Changed old comments to correct syntax
 * [**311c34e074a267441d4a276d436e10cbf91c6612**] ReactionListeners: Added MODE import for DJModes
 * [**928922cf0e2b04cab2976aa29797b27cbe7ca82c**] SetPrefix: Fixed that SetPrefix would set the custom prefix to the default
 * [**481d46fe83058102b0310b69a83601d4c1ef6a6f**] DJList: Fixed music undefined error

## 2020-07-25, Version v0.7.0 (**d2af4dd3b9b645fa10e99f94e8b36eb396329414**)

### Notable Changes

 * Instead of a static system a dynamic system to load "modules" was added and works very similarly as the CommandRegistrar
 * Docker containerization has been added and Damon Music can be pulled from hub.docker.com (private)
 * Logging will now be seperate per level, WARNING, ERROR, CRITICAL
 * MusicShutdown will instead of a hardcoded value use the humanize-duration module

### Commits (60)

 * [**9863afeba1a03b01e9137328e7f6af45370fe251**] Pushing preview of v0.7.0
 * [**4e77d26e71642eb4a5e5d9b36302cfd690230501**] Ported more commands from 0.6.8, fixed a bug in Queue
 * [**398491ba910e74b5ea30832ae418c1e5aa4ba68f**] Commands: Fixed import typo's
 * [**579dbed275a1faa458b14ae5273604591e50e965**] CommandRegistrar: Command output will be properly generated
 * [**cd9673496356dd29af71835da124388c55a71274**] Queue: Fixed self instance problem on reverse method
 * [**dc7459f919a09db1174dde694c12bfee20e8c544**] Log: Logs that aren't from level INFO will be written to a log file
 * [**326841bd9cac253e88f1e8cdc66c73d09fdbe664**] Log: Warning level will be logged properly
 * [**db4325096728ab870c4c843d69e6e42cea8b84cd**] ServerUtils: Added method that adds a guild to the DB
 * [**fceb9d544e38b5a3cbe85adea04575d71da913c6**] PresenceModule: Switched to use property based event triggering
 * [**2e5c59ee0bb40e1f458974581a5c50e85e905f06**] EventListenerModule: Ported old events
 * [**380bca8c01aded85b8049e6a25f30e3577abdeba**] ServerOptions: Added create method that will add a server to the DB
 * [**5772b8ccac9b5cf923302c97975a1b2bc548198d**] Queue: Fixed addOnPosition method
 * [**e012b180adc313c3d6ac38973b50f6809c44f620**] MusicShutdown: Switched to huminaze-duration instead of hardcoded value
 * [**a4d302e15b04878b4e0a3a684b3f0bb2f7866283**] MusicSystem: Changed log
 * [**9d0e76965e646a4785dd8e98cfc0edd42b24baff**] Modules: Fixed some typos in the EventListenerModule
 * [**8fbb28f46c0a85eb637478c4ca8f9023d7bfa69b**] Docker: Added docker file
 * [**088f5d4b562b390940a941ce7a446c767e131f11**] Git: Removed package-lock.json ignore line
 * [**31bd17d4f2fec0183b8b38bf7c51a667a0cb359b**] Docker: Updated Dockerfile to build package
 * [**9272448a91b6ea3cc1a94741297d701aeef28da0**] Data: Updated dev connection to connect externally
 * [**5ce0360341b309a1320980982c9c89271257fc01**] Docker: Added dockerignore file
 * [**696fca389fc05d8b9dbed92816c1487c313f9343**] SpotifyTrack: Fixed call to function being incorrect
 * [**8a7413ef07cb6e1afad861e741d2ad8463136120**] Docker: Optimised Dockerfile to npm install and then copy source code
 * [**e78d3f756c6691c78a7655fb11c99708a0b009ae**] Util: Added old util files and update IPv6 NDP script
 * [**dedd4c142da6aeca38a03324763936bba515a662**] Added exclude for Shard kill method to ignore files
 * [**f6aa025f3f9ab259d575229c75e7899abb19f2e4**] Docker: Use ENTRYPOINT instead of CMD
 * [**ceb3524f41ea45dd8835b24bf9616d58a910a409**] Data: Changed DB, renamed socket to ws
 * [**08d023ed52d43b9ede285aec98272802ce4e0939**] EntryPoint: Added SIGTERM shutdown
 * [**cdb2b758a60401d9ffbe5dc96a47def4e9ea92ad**] Sharding: Added ShardingManager#killAll and modified Shard#kill
 * [**4eb7902f08a793dd0b6d89e68e42af0f05fc47b5**] BotMain: Added shutdown log
 * [**492cfea0e3c5f621b366ba640653c746ca92acb3**] Commands: Modified SetPrefix and ResetPrefix
 * [**d4968e7875a3ac22004b21b719096bf7e3db6bf6**] Modules: Pushing WS communication progress
 * [**0c735e2bb314f2dd13f3c3c3b8931cbbc7f68ea4**] Depends: Updated scrape-youtube module
 * [**64fb8d8c267ded659854ad9e1b9ba7f11d850704**] Modules: Moved BaseModule into modules folder
 * [**f31c78fa98b5b7e67cc25cdfd07d8b66974194f7**] Pushing all progress
 * [**a9d04881ac947ecc8e65a4b411c8ae16e4252b05**] Constants: Added REPLY to TargetTypes
 * [**ed5a9f15f5fd1761a7da3a74e5f56fe16c20fc0e**] Package: Added uuid
 * [**07d99ea4b03e341a621771a6c0e12618ba52b8fb**] Main: Removed random semicolon
 * [**1afa44ea2d3793ff8f73871c6afe6cf4dfae25ac**] Module: CommonValues identifier string has been changed
 * [**5a4ed52596652da480a33e5b1fe028d1a38ff405**] ModuleManager: Made methods private, fixed some bugs and merged changes
 * [**0a1807374ac01292f34471942ff582782556d8fb**] EventListener: Added WebSocket event listener
 * [**2b5cde3db1684be75a74ef809ca9500d3f6f40cf**] PresenceModule: Changed commonValues to common
 * [**60a5b40de327c2a47771adb9e249c61407a2ad55**] WSCommunicator: Added sendEvent and sendReply methods
 * [**e4cafac1fdb2604a87d83a2c72c343e0884093af**] wsClient: Added REPLY support and fixed closeCode check
 * [**2f773129f9706b00dc31ab25e5cf30f6acf60ed4**] wsUtil: Removed because unusued
 * [**2ca58be26547c6a26cc969ef97fd58da306edcc1**] Constants: Removed REPLY target type and made it an OP code
 * [**f60bcdbdb0cbe015a0ed281ae9b948096f9171da**] wsClient: Added group getter
 * [**6c06e7071d658f22c75e4e3d4a87533f9a68b955**] wsCommunicator: Added "self" targetIdentifier and fxied REPLY flow
 * [**542e2ae62585cd091aa8780d2e4a99d71679ed8d**] wsClient: Improved REPLY flow
 * [**eab9638a08ad5ab888c9517e0f9bb8e2cc2d355e**] Renamed: main.js to Main.js
 * [**0439e8d70908a089f84c501eb48c6ddd241790e2**] EventListener: Added private comment
 * [**79b2658546ef256cd2243a86c62261bf2766097f**] MusicSystem: Fixed problem with album art
 * [**274157e67ce3ff5dfeb86949b414f07fc34a6123**] BaseCommand: merged upstream fixes from Soft & Wet into Damon Music
 * [**655b555e14bde78023b541bb78d58048992c22c6**] Constants: Updated events
 * [**2433d66fc90d18087c55e288ab871ad1b5dcc0a0**] Util: Removed useless import
 * [**324d90258000c000d6af00549af0996dab67f51c**] MusicCommand: The bot should new try to reset after having a deadlock
 * [**87609e4b2fe7efd338fe8c8d010228bb48754c62**] Modules: Added users getter
 * [**931e32235e431f937ed8c4ced62bf45ca63bab4e**] Merge: Upstreamed changes from Soft & Wet
 * [**a3e56464ff9c1d020e12846953415afdd459d6d9**] Util: Updated flatten method
 * [**ad0e8875e0a5acb9dbbe8974286134cc388af66e**] Merge: Upstream added admin commands from Soft & Wet
 * [**d2af4dd3b9b645fa10e99f94e8b36eb396329414**] Merge: Upstream added WebSocketCommand from Soft & Wet

## 2020-06-20, Version v0.6.8 @Yimura

### Notable Changes

 * An issue was resolved where the delayed shutdown would send a message for a different shutdown type
 * The reset prefix command has been reworked to properly do its job
 * Fixed an issue where a user banned boolean never would become true until the bot was restarted
 * A SpotifyTrack will be more memory efficient in the future

### Commits

 * [**7d67d87c1918b869a3139821a29552296f111857**] MusicShutdown: Fixed an issue where delayed shutdown would message for different shutdown modes
 * [**5a5ff427b8c1e428c10cd28c8f78a8842a367826**] Commands: ResetPrefix command will now properly reset a guilds prefix
 * [**4221ad4c65d9ca60224d62db3bd30de0c69b6aec**] UserOptions: User banned boolean would never become true until restart
 * [**ef0bd6583ab8f63064487423ce73583edd09cf87**] SpotifyTrack: Made more memory efficient than before

## 2020-06-11, Version v0.6.7 @Yimura

### Notable Changes

 * Changes to Music System:
    * A shorthand was added to get the LavaLink carrier
    * A new method was added to properly get a SoundLink to Discord, if one existed or one needed to be created
    * The bot will now check more in depth if it has the permission to join a voice channel

### Commits

 * [**d3fb12dfb59665c3325f42fb8416a05e2ed174ea**] MusicSystem: Damon should now properly get the player object

## 2020-06-11, Version v0.6.6 @Yimura

### Notable Changes

 * An old unused dependency was removed: node-opus
 * SpotifyTrack will try and search for a track that is only audio oriented
 * Prep work has been done to the DJ System so it's ready for seamlessly reloading Music System
 * Check if the #isDamonInVC is called with a valid VoiceChannel instance
 * The permission system has been fixed where in certain edge cases it would allow the command to just run
 * Removed redundant `error data` command
 * The reset method from MusicSystem has a boolean disconnect param
 * A proper stack trace was added to LavaLink
 * `reset prefix` fixed incorrect reference name to the CommandRegistrar

### Commits (12)

 * [**55e1f3e2729d1250065ea9b297841b11873f3ac7**] Dependencies: Removed node-opus dependency
 * [**53b6e5460e185ac949a936ab3ec2e6f0fe5fb90b**] BotEvents: Check if a type of delayed shutdown has been set already
 * [**8bde5a6846323bd8b636f072e2ff30f4b38033e0**] MusicSystem: Check if voiceChannel value is valid in #isDamonInVC
 * [**1a8af38237cafbfc05b074f84bf8ad98fa2680f7**] BaseCommand: Further optimised permission system
 * [**4465876475260f27e8091b4b5c0521afc1519993**] SpotifyTrack: EquivSearch will attempt getting audio over video
 * [**978e69cb98b4140e13da51a6444d70328e626108**] DJManagement: Changed DJUser store to facilitate upgrading music system
 * [**5321bd1a0e40210b7bb3d4673f3297fac0850f7e**] Commands: More in depth reload possibilities
 * [**a76d5b9e10ec41e32f0954dffee3da7cc036237b**] Commands: Removed useless error data command
 * [**3f3578b6826973c06f55271ae9b838989b83e714**] Commands: Fixed incorrect reference name to the CommandRegistrar
 * [**7be39e125d87d4b0eb6b31163e5aa2757f617fd7**] MusicUtils: Bot won't leave when resuming music playback
 * [**9d9941036d0aba380fdcc72a7590e115c91bae67**] MusicSystem: reset has disconnect param, added #soundStart
 * [**7711d5db11ce4fa16a7db4b94860bc1d3950935b**] BotMain: Added stack trace with LavaLink errors

## 2020-06-01, Version v0.6.5 @Yimura

### Notable Changes

 * A command reloading feature has been added, might be useful someday
 * The SpotifyAPI token will only be refreshed when a request is made and the token has expired
 * Added proper shutdown when the bot is kicked from its voice channel

### Commits

 * [**2c3d0bb13ba1ac5e6a7e48aa8d34fa1e8c87c163**] Choice: Undefined i
 * [**2e8ee5e07b635162c2dfe3226e351ded059f565c**] CommandRegistrar: Added noCache option and reload commands command
 * [**f7d08cc371726d8aca97bead005c0ec7577dacc7**] SpotifyAPI: Token will only be refreshed with a request and old one is expired
 * [**ed57e01969b9990d1c56f7f6b5ed29e26a7c6b76**] BotEvents: When force kicked from its voice channel the bot should reset properly

## 2020-05-31, Version v0.6.4 @Yimura

### Notable Changes

 * Added support for Spotify Albums
 * Renamed CommandRegisterer to CommandRegistrar to be grammatically correct
 * Queue will check if a track is defined when not null
 * A persist mode command was added for the DJ system
 * A DJ info command was added to properly explain the DJ system

### Commits

 * [**03736f0efc5ee3f9f075b35e9a7b2ca8200fcb73**] Restructuring: Renamed CommandRegisterer to CommandRegistrar
 * [**0b94c0c0b42f250ddd11d93c79f129f6b958e52c**] Commands: Queue command will now check if track is defined
 * [**71331aadc1ce07781bae9d91d3855ae7fbf48751**] MusicSystem: Try getting song data multiple times before failing
 * [**7f89ec6a5dfaf6046a810b181c016c840aa5d56b**] DJManager: Added persist option to #setMode
 * [**69581bfae37cfa9b9b5987cd17c67416f0ae8733**] SpotifyTrack: Added exception for image overwrite
 * [**9168e7d60492969005a0f4c6d8f76ad6c9db6a45**] MusicUtils: Fixed typo
 * [**29126299e29f00fc6a38ff283ae5f7de00d7b0fe**] Commands: Added set dj mode persist command
 * [**ed8b444ac3476e4b4c87cb841c6576ff7d4bbff8**] Commands: Added a DJ info command that will explain how the DJ system works
 * [**2eb410d355a53b6f4ac42cbd05eba5b273f9703c**] Commands: Updated dj mode command to suggest dj info command
 * [**539a8256f8718875bc7d87e863cc0b9b8dbfbdb1**] Commands: Added support for Spotify Albums to Play commands
 * [**3c817b886b495bc18a51410ead6b5c1026d19d80**] MusicSystem: Tried fixing the problem with bot getting stuck
 * [**c918c2ae39fc931c98a6ac0552038746c9619486**] Data: Regenerated commands.json with new DJ commands

## 2020-05-28, Version v0.6.3 @Yimura

### Notable Changes

 * MusicSystem will add TrackEnd listeners only after TrackStart event has fired
 * SpotifyTrack will now properly handle if it has cached itself or not
 * The default DJ mode will now be `FREEFORALL`
 * The DJ user revoke message will be removed when the DJ rejoins

### Commits

 * [**43119b92bf9326c1f4014c9037f29c2db1a2044b**] DJManager: Changed default DJ Mode to FREEFORALL
 * [**ee11cf4f5b620e5f0a17022d43d0805307d5fe8f**] DJUser: The DJ User message will be removed when the DJ rejoins
 * [**0dcb7e2acd37254de9c3551b491d08ab3d142c52**] MusicSystem: Will now wait for track start event before listening on track events
 * [**7390614dd8921a8065814d4aaec58fa6782bfaa9**] SpotifyTrack: Made check for song caching will be properly added

## 2020-05-27, Version v0.6.2 @Yimura

### Notable Changes

 * A more accurate way of counting active music players was added
 * Fixed a bug where hidden commands would not be mapped
 * Added a missing require in DJUser
 * Multiple attempts will be made to cross match a Spotify song to YouTube
 * If player.stopTrack fails we assume the song already stopped and call the soundEnd
 * Added Rest bug hotfix that was shortly removed
 * Bumped version Discord.js version to 12.2.0
 * A bug was fixed related to variable reusing

### Commits

 * [**4ebb08dae2cc236c5de63e29ce4eb673391637b2**] BotMain: Cleaned up code and more accurate MusicPlayer counter
 * [**9506b42c1a2ce709de38fb6b7fe50446a390e421**] CommandRegistrar: Fixed bug where hidden commands wouldn't be mapped
 * [**1e36669f90501a237bd17d40f904806477efa726**] DJUser: Fixed missing require
 * [**27e6f722585b0ed1e6ba6e6288d873b2dbe91fab**] MusicSystem: Moved method from position to be alphabetical
 * [**3db843368f3449c63003cf5379fb38b75d120988**] TrackSpotify: Multiple attempts will be made at finding a song before giving up
 * [**19ea3c4d78302633d840ce70bb779bf7b2836e36**] BaseCommand: Change soft-wet with music domain name
 * [**7077f3f661caab8cffd1f1bfdd6e72ad03264658**] MusicSystem: If player.stopTrack returns false we force the soundEnd
 * [**68cfea0cc519f135b648e24d5153e19dacebdc0d**] SpotifyTrack: Cleaned up stupid mistakes
 * [**f128b23abc6e895342c9998598fafbd18d8de8fc**] Version: Updated Discord.js to 12.2.0
 * [**ecec8bc179e5cdfa128a0ac5d69bad24ef622f7c**] Commands: Attempt at adding an error logging file
 * [**80db2fedb6eec0986e770cbb345ca350670703a7**] Rest: Thought the bug was fixed, it wasn't

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
