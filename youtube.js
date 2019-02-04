const
    {google} = require('googleapis'),
    youtube = google.youtube({
        version: 'v3',
        auth: 'AIzaSyDttVSLrswRkoH_AIlx45nVrEfIp4TxsLs'
    });

exports.getSongInfoById = async function (videoId) {
    const res = await youtube.videos.list({
        part: 'snippet,statistics',
        id: videoId
    });

    var
        song = res.data.items[0],
        thumbnails = song.snippet.thumbnails,
        url = "";

    if (thumbnails.maxres != undefined)
        url = thumbnails.maxres.url;
    else if (thumbnails.standard != undefined)
        url = thumbnails.standard.url;
    else if (thumbnails.high != undefined)
        url = thumbnails.high.url;
    else if (thumbnails.medium != undefined)
        url = thumbnails.medium.url;
    else if (thumbnails.default != undefined)
        ulr = thumbnails.default.url;

    return {
        title: song.snippet.title,
        uploader: song.snippet.channelTitle,
        thumbnail: url,
        statistics: song.statistics
    };
};
