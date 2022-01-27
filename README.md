# bakana-hayasugiru

bakana-hayasugiru is a bot that notify YouTube channel video posting and checking posted at regular time.

Developed for [〇〇の主役は我々だ!](https://www.youtube.com/c/NemesisLaAlgol1936) notifications.

## Installation

1. Clone repository

```
$ git clone https://github.com/sera1mu/bakana-hayasugiru.git
```

2. Install dependencies (Not production)

```
$ yarn install
```

3. Build

```
$ yarn build
```

4. Create `config.json` file at project root

5. Write it with reference to [Configuration](#configuration)

6. Start

```
PORT={PORT NUMBER} node dist/index.js
```


## Notify with Zapier

**Note:**

In order to use Zapier, you must have external access to the API server.

Zapier is a service that allows you to integrate web applications to automate tasks.
We will use this to do notifications this time. Please register with Zapier in advance.

Duplicate [this template](https://zapier.com/shared/e3db3687abb75d66ea9a44ff81ee947b5be65ffa).

Next, open an editor with Edit Zap. Replace the following

* YouTube: `[CHANNEL_ID]` -> ID of the channel to notify.

![CHANNEL_ID](https://i.imgur.com/sI8HRch.png)

* Webhook: `[URL]` -> destination to POST to (https://{hostname}/v1/notify)

![URL](https://i.imgur.com/FDLcu10.png)

* Webhook: `[API KEY]` -> API_KEY to be notified (see [Configuration](#configuration)).

![API KEY](https://i.imgur.com/nF6rzfL.png)

Translated with www.DeepL.com/Translator (free version)

## Configuration

Create a file called "config.json" in the project root and configure it.

| KEY                    | TYPE     | DESCRIPTION                                                                                                                                                                    |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| apiKey                 | `string` | The key required when notifying the API (specified in the X-Api-Key header.)                                                                                                   |
| lineChannelAccessToken | `string` | Tokens required to send messages to your LINE account. ([see here](https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/#long-lived-channel-access-tokens)) |
| postTime               | `string` | Time to be posted (hh:mm)                                                                                                                                                      |
| timezone               | `string` | Date [timezone](https://momentjs.com/timezone/)                                                                                                                                |
| youTubeAPIKey          | `string` | Key required to access the YouTube Data API. (Not OAuth2                                                                                                                       | [see here](https://developers.google.com/youtube/registering_an_application)) |

Example:
```json
{
  "apiKey": "<API KEY HERE>",
  "lineChannelAccessToken": "<TOKEN HERE>",
  "postTime": "18:00",
  "timezone": "Asia/Tokyo",
  "youTubeAPIKey": "<API KEY HERE>"
}
```

## License

MIT (c) 2022 Seraimu.
