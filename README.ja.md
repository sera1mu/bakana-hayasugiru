# bakana-hayasugiru

bakana-hayasugiru はYouTubeチャンネルの動画投稿と動画が通常の時間に投稿されているかチェックして通知するBotです。

[〇〇の主役は我々だ!](https://www.youtube.com/c/NemesisLaAlgol1936) の通知のために開発されました。

## Installation

1. リポジトリをクローン

```
$ git clone https://github.com/sera1mu/bakana-hayasugiru.git
```

2. 依存しているパッケージをインストール (プロダクション用でない)

```
$ yarn install
```

3. ビルド

```
$ yarn build
```

4. `config.json` をプロジェクトルートに作成

5. [Configuration](#configuration) を参考に記述

6. 起動

```
PORT={ポート番号} node dist/index.js
```

**これで終わりではありません!!**

このBotは動画投稿の通知をAPIから受信するため、送信するシステムを用意する必要があります。
これには[Zapier](https://zapier.com/)を使用することをおすすめします。
詳しくは[Notify with Zapier](#notify-with-zapier)を御覧ください。

## Notify with Zapier

**注意:**

Zapierを使用するためには、APIサーバーに外部からアクセスできる必要があります。

Zapierは作業の自動化を行うためのWebアプリケーションを統合できるようにするサービスです。
これを使って今回は通知を行います。事前にZapierに登録しておいてください。

[このテンプレート](https://zapier.com/shared/e3db3687abb75d66ea9a44ff81ee947b5be65ffa)を複製してください。

次に、Edit Zapでエディタを開きます。以下を置き換えてください。

* YouTube: `[CHANNEL_ID]` -> 通知するチャンネルのID

![CHANNEL_ID](https://i.imgur.com/sI8HRch.png)

* Webhook: `[URL]` -> POSTする宛先 (https://{ホスト名}/v1/notify)

![URL](https://i.imgur.com/FDLcu10.png)

* Webhook: `[API KEY]` -> 通知するためのAPI_KEY ([Configuration](#configuration)を御覧ください。)

![API KEY](https://i.imgur.com/nF6rzfL.png)

## Configuration

"config.json" というファイルをプロジェクトルートに作成し設定してください。

| KEY                    | TYPE     | DESCRIPTION                                                                                                                                                                       |
| ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey                 | `string` | APIに通知するときに必要なキー (X-Api-Key ヘッダに指定します。)                                                                                                                    |
| lineChannelAccessToken | `string` | LINEアカウントにメッセージを送信するために必要なトークン。 ([こちら]](https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/#long-lived-channel-access-tokens)) |
| postTime               | `string` | 通常の投稿時間(hh:mm)                                                                                                                                                             |
| timezone               | `string` | Dateの[タイムゾーン](https://momentjs.com/timezone/)                                                                                                                              |
| youTubeAPIKey          | `string` | YouTube Data APIにアクセスするためのキー(OAuth2ではない)                                                                                                                          | [こちら](https://developers.google.com/youtube/registering_an_application)) |

例:
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
