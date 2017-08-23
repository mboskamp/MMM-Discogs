# MMM-Discogs
MMM-Discogs is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

It connects to your [Discogs.com](https://www.discogs.com/) profile and displays a random release from your collection.
To use it you need to aquire an API token from [here](https://www.discogs.com/de/settings/developers) and state it in the config file of your Magic Mirror instance.

## Installation
Just clone the module into your MagicMirror modules folder and execute `npm install` in the module's directory.
```
git clone https://github.com/mboskamp/MMM-Discogs.git
cd MMM-Discogs
npm install
```
## Configuration
To display the module insert it in the config.js file. Here is an example:
```
{
    module: 'MMM-Discogs',
    position: 'bottom_center',
    config: {
        apiToken: 'AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMn',
        username: 'username',
        updateDomInterval: 30000, //30 seconds
        fetchCollection: 0, //collection will be fetched on every DOM reload
        animationSpeed: 1000 //Displaying the next record will take one second to complete
    }
}
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| username | The username of your [discogs.com](https://www.discogs.com/) profile. | **String**  | **required** |
| apiToken | In order to access your Discogs data you need an API token which can be aquired [here](https://www.discogs.com/de/settings/developers).| **String** | **required** |
| updateDomInterval |The time (in miliseconds) after which a new record should be show. | **Integer** | **600.000** <br> **(10 minutes)** |
| fetchCollection | The amount of times the DOM will update without prior collection re-fetch. | **Integer** | **50** |
| animationSpeed | The duration (in miliseconds) of the reload animation.  | **Integer**  | **750** |
# MMM-Discogs
MMM-Discogs is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

It connects to your [Discogs.com](https://www.discogs.com/) profile and displays a random release from your collection.
To use it you need to aquire an API token from [here](https://www.discogs.com/de/settings/developers) and state it in the config file of your Magic Mirror instance.

## Installation
Just clone the module into your MagicMirror modules folder and execute `npm install` in the module's directory.
```
git clone https://github.com/mboskamp/MMM-Discogs.git
cd MMM-Discogs
npm install
```
## Configuration
To display the module insert it in the config.js file. Here is an example:
```
{
    module: 'MMM-Discogs',
    position: 'bottom_center',
    config: {
        apiToken: 'AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMn',
        username: 'username',
        updateDomInterval: 30000, //30 seconds
        fetchCollection: 0, //collection will be fetched on every DOM reload
        animationSpeed: 1000 //Displaying the next record will take one second to complete
    }
}
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| username | The username of your [discogs.com](https://www.discogs.com/) profile. | **String**  | **required** |
| apiToken | In order to access your Discogs data you need an API token which can be aquired [here](https://www.discogs.com/de/settings/developers).| **String** | **required** |
| updateDomInterval |The time (in miliseconds) after which a new record should be show. | **Integer** | **600.000** <br> **(10 minutes)** |
| fetchCollection | The amount of times the DOM will update without prior collection re-fetch. | **Integer** | **50** |
| animationSpeed | The duration (in miliseconds) of the reload animation.  | **Integer**  | **750** |
