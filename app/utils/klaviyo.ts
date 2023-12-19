import { type Product } from "./adminApi";

const klaviyoUrl = "https://a.klaviyo.com/api";
const klaviyoApiKey = `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`;

async function postToKlaviyo(resource: string, body: any) {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      revision: "2023-12-15",
      "content-type": "application/json",
      Authorization: klaviyoApiKey,
    },
    body: JSON.stringify(body),
  };
  try {
    const response = await fetch(`${klaviyoUrl}/${resource}/`, options);
    const json = await response.json();
    return json;
  } catch (e) {
    console.error(e);
    return "";
  }
}

export async function createList(name: string): Promise<string> {
  const body = {
    data: {
      type: "list",
      attributes: {
        name,
      },
    },
  };
  const response = await postToKlaviyo("lists", body);
  return response?.data?.id;
}

export async function createTemplate(
  dropName: string,
  products: Product[]
): Promise<string> {
  const body = {
    data: {
      type: "template",
      attributes: {
        name: dropName,
        editor_type: "CODE",
        html: generateEmailMarkup(products),
        text: `Drop starts now: ${dropName}`,
      },
    },
  };
  const response = await postToKlaviyo("templates", body);
  return response?.data?.id;
}

function generateEmailMarkup(products: Product[]): string {
  return `
<!DOCTYPE html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:v="urn:schemas-microsoft-com:vml"
>
  <head>
    <title> </title>

    <meta content="IE=edge" http-equiv="X-UA-Compatible" />

    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG />
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <!--[if lte mso 11]>
      <style type="text/css" data-inliner="ignore">
        .mj-outlook-group-fix {
          width: 100% !important;
        }
      </style>
    <![endif]-->

    <style>
      u + .body .gmail-blend-screen { background:#000; mix-blend-mode:screen; }
      u + .body .gmail-blend-difference { background:#000; mix-blend-mode:difference; }
      a:link {
        color: #15c;
        font-weight: normal;
        text-decoration: underline;
        font-style: normal;
      }
      a:visited {
        color: #15c;
        font-weight: normal;
        text-decoration: underline;
        font-style: normal;
      }
      a:active {
        color: #15c;
        font-weight: normal;
        text-decoration: underline;
        font-style: normal;
      }
      a:hover {
        color: #15c;
        font-weight: normal;
        text-decoration: underline;
        font-style: normal;
      }
    </style>
    <style>
      @import url(https://static-forms.klaviyo.com/fonts/api/v1/VSrWPM/custom_fonts.css);
      #outlook a {
        padding: 0;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0;
        mso-table-rspace: 0;
      }
      img {
        border: 0;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      p {
        display: block;
        margin: 13px 0;
      }
      @media only screen and (min-width: 480px) {
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      }
      .moz-text-html .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
      @media only screen and (max-width: 480px) {
        div.kl-row.colstack div.kl-column {
          display: block !important;
          width: 100% !important;
        }
      }
      @media only screen and (max-width: 480px) {
        .kl-text {
          padding-right: 18px !important;
          padding-left: 18px !important;
        }
      }
      @media only screen and (max-width: 480px) {
        .component-wrapper .mob-no-spc {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      }
      .hlb-subblk td {
        word-break: normal;
      }
      @media only screen and (max-width: 480px) {
        .hlb-wrapper .hlb-block-settings-content {
          padding: 9px !important;
        }
        .hlb-logo {
          padding-bottom: 9px !important;
        }
        .r2-tbl {
          width: 100%;
        }
        .r2-tbl .lnk {
          width: 100%;
        }
        .r2-tbl .hlb-subblk:last-child {
          padding-right: 0 !important;
        }
        .r2-tbl .hlb-subblk {
          padding-right: 10px !important;
        }
        .kl-hlb-stack {
          display: block !important;
          width: 100% !important;
          padding-right: 0 !important;
        }
        .kl-hlb-stack.vspc {
          margin-bottom: 9px;
        }
        .kl-hlb-wrap {
          display: inline-block !important;
          width: auto !important;
        }
        .kl-hlb-no-wrap {
          display: table-cell !important;
        }
        .kl-hlb-wrap.nospc.nospc {
          padding-right: 0 !important;
        }
      }
      @media only screen and (max-width: 480px) {
        .kl-product-cell-stack {
          display: block !important;
          width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      }
      @media screen and (max-width: 480px) {
        .kl-sl-stk {
          display: block !important;
          width: 100% !important;
          padding: 0 0 9px !important;
          text-align: center !important;
        }
        .kl-sl-stk.lbls {
          padding: 0 !important;
        }
        .kl-sl-stk.spcblk {
          display: none !important;
        }
      }
      @media only screen and (max-width: 480px) {
        table.mj-full-width-mobile {
          width: 100% !important;
        }
        td.mj-full-width-mobile {
          width: auto !important;
        }
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        max-width: 100%;
      }
      .root-container {
        background-repeat: repeat !important;
        background-size: auto !important;
        background-position: left top !important;
      }
      .root-container-spacing {
        padding-top: 50px !important;
        padding-bottom: 20px !important;
        font-size: 0 !important;
      }
      .content-padding {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .content-padding.first {
        padding-top: 0 !important;
      }
      .content-padding.last {
        padding-bottom: 0 !important;
      }
      @media only screen and (max-width: 480px) {
        td.mobile-only {
          display: table-cell !important;
        }
        div.mobile-only {
          display: block !important;
        }
        table.mobile-only {
          display: table !important;
        }
        .desktop-only {
          display: none !important;
        }
      }
      @media only screen and (max-width: 480px) {
        .table-mobile-only {
          display: table-cell !important;
          max-height: none !important;
        }
        .table-mobile-only.block {
          display: block !important;
        }
        .table-mobile-only.inline-block {
          display: inline-block !important;
        }
        .table-desktop-only {
          max-height: 0 !important;
          display: none !important;
          mso-hide: all !important;
          overflow: hidden !important;
        }
      }
      p {
        margin-left: 0;
        margin-right: 0;
        margin-top: 0;
        margin-bottom: 0;
        padding-bottom: 1em;
      }
      @media only screen and (max-width: 480px) {
        .kl-text > div,
        .kl-table-subblock div,
        .kl-split-subblock > div {
          font-size: 14px !important;
          line-height: 1.3 !important;
        }
      }
      h1 {
        color: #222;
        font-family: "Helvetica Neue", Arial;
        font-size: 40px;
        font-style: normal;
        font-weight: normal;
        line-height: 1.1;
        letter-spacing: 0;
        margin: 0;
        margin-bottom: 20px;
        text-align: left;
      }
      @media only screen and (max-width: 480px) {
        h1 {
          font-size: 40px !important;
          line-height: 1.1 !important;
        }
      }
      h2 {
        color: #222;
        font-family: "Helvetica Neue", Arial;
        font-size: 32px;
        font-style: normal;
        font-weight: bold;
        line-height: 1.1;
        letter-spacing: 0;
        margin: 0;
        margin-bottom: 16px;
        text-align: left;
      }
      @media only screen and (max-width: 480px) {
        h2 {
          font-size: 32px !important;
          line-height: 1.1 !important;
        }
      }
      h3 {
        color: #222;
        font-family: "Helvetica Neue", Arial;
        font-size: 24px;
        font-style: normal;
        font-weight: bold;
        line-height: 1.1;
        letter-spacing: 0;
        margin: 0;
        margin-bottom: 12px;
        text-align: left;
      }
      @media only screen and (max-width: 480px) {
        h3 {
          font-size: 24px !important;
          line-height: 1.1 !important;
        }
      }
      h4 {
        color: #222;
        font-family: "Helvetica Neue", Arial;
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: 0;
        margin: 0;
        margin-bottom: 9px;
        text-align: left;
      }
      @media only screen and (max-width: 480px) {
        h4 {
          font-size: 18px !important;
          line-height: 1.1 !important;
        }
      }
      @media only screen and (max-width: 480px) {
        .root-container {
          width: 100% !important;
        }
        .root-container-spacing {
          padding: 10px !important;
        }
        .content-padding {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .content-padding.first {
          padding-top: 0 !important;
        }
        .content-padding.last {
          padding-bottom: 0 !important;
        }
        .component-wrapper {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      }
    </style>
  </head>
  <body style="word-spacing: normal; background-color: #ffffff">
    <div
      class="root-container"
      id="bodyTable"
      style="background:#fff; background-image:linear-gradient(#fff,#fff); color:#fff;"
    >
      <div class="root-container-spacing gmail-blend-screen">
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          class="kl-section"
          role="presentation"
          style="width: 100%"
        >
          <tbody>
            <tr>
              <td>
                <div style="margin: 0px auto; max-width: 600px">
                  <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="width: 100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          style="
                            border-bottom: solid 1px #aaaaaa;
                            border-left: solid 1px #aaaaaa;
                            border-right: solid 1px #aaaaaa;
                            border-top: solid 1px #aaaaaa;
                            direction: ltr;
                            font-size: 0px;
                            padding: 0px;
                            text-align: center;
                          "
                        >
                          <div
                            style="
                              margin: 0px auto;
                              border-radius: 0px 0px 0px 0px;
                              max-width: 600px;
                            "
                          >
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                width: 100%;
                                border-radius: 0px 0px 0px 0px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      direction: ltr;
                                      font-size: 0px;
                                      padding: 20px 0;
                                      padding-bottom: 10px;
                                      padding-left: 0px;
                                      padding-right: 0px;
                                      padding-top: 10px;
                                      text-align: center;
                                    "
                                  >
                                    <div class="content-padding first">
                                      <div
                                        class="kl-row colstack"
                                        style="
                                          display: table;
                                          table-layout: fixed;
                                          width: 100%;
                                        "
                                      >
                                        <div
                                          class="kl-column"
                                          style="
                                            display: table-cell;
                                            vertical-align: top;
                                            width: 100%;
                                          "
                                        >
                                          <div
                                            class="mj-column-per-100 mj-outlook-group-fix component-wrapper kl-text-table-layout"
                                            style="
                                              font-size: 0px;
                                              text-align: left;
                                              direction: ltr;
                                              vertical-align: top;
                                              width: 100%;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="width: 100%"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr>
                                                  <td
                                                    class=""
                                                    style="
                                                      vertical-align: top;
                                                      padding-top: 0px;
                                                      padding-right: 0px;
                                                      padding-bottom: 0px;
                                                      padding-left: 0px;
                                                    "
                                                  >
                                                    <table
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      role="presentation"
                                                      style=""
                                                      width="100%"
                                                    >
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            align="center"
                                                            class="kl-text"
                                                            style="
                                                              font-size: 0px;
                                                              padding: 0px;
                                                              padding-top: 9px;
                                                              padding-right: 18px;
                                                              padding-bottom: 9px;
                                                              padding-left: 18px;
                                                              word-break: break-word;
                                                            "
                                                          >
                                                            <div
                                                              style="
                                                                font-family: 'Helvetica Neue',
                                                                  Arial;
                                                                font-size: 9px;
                                                                font-style: normal;
                                                                font-weight: 400;
                                                                letter-spacing: 1px;
                                                                line-height: 1.3;
                                                                text-align: center;
                                                                color: #727272;
                                                              "
                                                            >
                                                              Can't see this email? {% web_view %}
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                          <div
                                            class="mj-column-per-100 mj-outlook-group-fix component-wrapper hlb-wrapper"
                                            style="
                                              font-size: 0px;
                                              text-align: left;
                                              direction: ltr;
                                              vertical-align: top;
                                              width: 100%;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="width: 100%"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr>
                                                  <td
                                                    class="hlb-block-settings-content"
                                                    style="
                                                      vertical-align: top;
                                                      padding-top: 9px;
                                                      padding-right: 18px;
                                                      padding-bottom: 9px;
                                                      padding-left: 18px;
                                                    "
                                                  >
                                                    <table
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      role="presentation"
                                                      style=""
                                                      width="100%"
                                                    >
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            align="top"
                                                            class="kl-header-link-bar"
                                                            style="
                                                              font-size: 0px;
                                                              padding: 0px 0px
                                                                0px 0px;
                                                              word-break: break-word;
                                                            "
                                                          >
                                                            <table
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              style="
                                                                color: #000000;
                                                                font-family: Ubuntu,
                                                                  Helvetica,
                                                                  Arial,
                                                                  sans-serif;
                                                                font-size: 13px;
                                                                line-height: 22px;
                                                                table-layout: auto;
                                                                width: 100%;
                                                                border: 0;
                                                              "
                                                              width="100%"
                                                            >
                                                              <tbody>
                                                                <tr>
                                                                  <td
                                                                    align="center"
                                                                    class="hlb-logo"
                                                                    style="
                                                                      display: table-cell;
                                                                      width: 100%;
                                                                      padding-bottom: 14px;
                                                                    "
                                                                  >
                                                                    <table
                                                                      border="0"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      style="
                                                                        border-collapse: collapse;
                                                                        border-spacing: 0px;
                                                                      "
                                                                    >
                                                                      <tbody>
                                                                        <tr>
                                                                          <td
                                                                            style="
                                                                              width: 380px;
                                                                            "
                                                                          >
                                                                            <a
                                                                              href="https://nrf-thebrand.myshopify.com/"
                                                                              style="
                                                                                color: #15c;
                                                                                font-style: normal;
                                                                                font-weight: normal;
                                                                                text-decoration: underline;
                                                                              "
                                                                              target="_blank"
                                                                            >
                                                                              <img
                                                                                alt=""
                                                                                src="https://d3k81ch9hvuctc.cloudfront.net/company/VSrWPM/images/f3d7c6fe-5209-4702-b962-574e168b1e1c.png"
                                                                                style="
                                                                                  display: block;
                                                                                  outline: none;
                                                                                  text-decoration: none;
                                                                                  height: auto;
                                                                                  width: 100%;
                                                                                  background-color: transparent;
                                                                                "
                                                                                width="380"
                                                                              />
                                                                            </a>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>

                                      <div
                                        class="kl-row colstack"
                                        style="
                                          display: table;
                                          table-layout: fixed;
                                          width: 100%;
                                        "
                                      >
                                        <div
                                          class="kl-column"
                                          style="
                                            display: table-cell;
                                            vertical-align: top;
                                            width: 100%;
                                          "
                                        >
                                          <div
                                            class="mj-column-per-100 mj-outlook-group-fix component-wrapper kl-text-table-layout"
                                            style="
                                              font-size: 0px;
                                              text-align: left;
                                              direction: ltr;
                                              vertical-align: top;
                                              width: 100%;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="width: 100%"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr>
                                                  <td
                                                    class=""
                                                    style="
                                                      background-color: #ffffff;
                                                      vertical-align: top;
                                                      padding-top: 0px;
                                                      padding-right: 0px;
                                                      padding-bottom: 0px;
                                                      padding-left: 0px;
                                                    "
                                                  >
                                                    <table
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      role="presentation"
                                                      style=""
                                                      width="100%"
                                                    >
                                                      <tbody>
                                                        <tr class="gmail-blend-screen">
                                                          <td
                                                            align="center"
                                                            class="kl-text"
                                                            style="
                                                              background: #262626;
                                                              font-size: 0px;
                                                              padding: 0px;
                                                              padding-top: 27px;
                                                              padding-right: 18px;
                                                              padding-bottom: 27px;
                                                              padding-left: 18px;
                                                              word-break: break-word;
                                                            "
                                                          >
                                                            <div
                                                              style="
                                                                font-family: Helvetica,
                                                                  Arial;
                                                                font-size: 34px;
                                                                font-style: normal;
                                                                font-weight: 700;
                                                                letter-spacing: 1px;
                                                                line-height: 1.3;
                                                                text-align: center;
                                                                color: #ffffff;
                                                              "
                                                            >
                                                              <div>
                                                                DROP STARTS NOW
                                                              </div>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                          <div
                                            class="mj-column-per-100 mj-outlook-group-fix component-wrapper"
                                            style="
                                              font-size: 0px;
                                              text-align: left;
                                              direction: ltr;
                                              vertical-align: top;
                                              width: 100%;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="width: 100%"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr>
                                                  <td
                                                    class=""
                                                    style="
                                                      vertical-align: top;
                                                      padding-top: 9px;
                                                      padding-right: 18px;
                                                      padding-bottom: 9px;
                                                      padding-left: 18px;
                                                    "
                                                  >
                                                    <table
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      role="presentation"
                                                      style=""
                                                      width="100%"
                                                    >
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            align="left"
                                                            style="
                                                              font-size: 0px;
                                                              padding: 0px;
                                                              word-break: break-word;
                                                            "
                                                          >
                                                            <div
                                                              style="
                                                                font-family: Ubuntu,
                                                                  Helvetica,
                                                                  Arial,
                                                                  sans-serif;
                                                                font-size: 13px;
                                                                line-height: 1;
                                                                text-align: left;
                                                                color: #000000;
                                                              "
                                                            >
                                                            <!--products go here-->
                                                            ${products
                                                              .map(
                                                                generateProductMarkup
                                                              )
                                                              .join("")}

                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                          <div
                                            class="mj-column-per-100 mj-outlook-group-fix component-wrapper"
                                            style="
                                              font-size: 0px;
                                              text-align: left;
                                              direction: ltr;
                                              vertical-align: top;
                                              width: 100%;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="width: 100%"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr class="gmail-blend-screen">
                                                  <td
                                                    style="
                                                      background-color: #262626;
                                                      vertical-align: top;
                                                      padding-top: 9px;
                                                      padding-right: 9px;
                                                      padding-bottom: 9px;
                                                      padding-left: 9px;
                                                    "
                                                  >
                                                    <table
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      role="presentation"
                                                      style=""
                                                      width="100%"
                                                    >
                                                      <tbody>
                                                        <tr>
                                                          <td>
                                                            <div
                                                              style="
                                                                width: 100%;
                                                                text-align: center;
                                                              "
                                                            >
                                                              <div
                                                                class=""
                                                                style="
                                                                  display: inline-block;
                                                                  padding-right: 10px;
                                                                "
                                                              >
                                                                <div
                                                                  style="
                                                                    text-align: center;
                                                                  "
                                                                >
                                                                  <img
                                                                    alt="Button Text"
                                                                    src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/subtleinverse/facebook_96.png"
                                                                    style="
                                                                      width: 48px;
                                                                    "
                                                                    width="48"
                                                                  />
                                                                </div>
                                                              </div>

                                                              <div
                                                                class=""
                                                                style="
                                                                  display: inline-block;
                                                                  padding-right: 10px;
                                                                "
                                                              >
                                                                <div
                                                                  style="
                                                                    text-align: center;
                                                                  "
                                                                >
                                                                  <img
                                                                    alt="Custom"
                                                                    src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/subtleinverse/twitter_96.png"
                                                                    style="
                                                                      width: 48px;
                                                                    "
                                                                    width="48"
                                                                  />
                                                                </div>
                                                              </div>

                                                              <div
                                                                class=""
                                                                style="
                                                                  display: inline-block;
                                                                  padding-right: 10px;
                                                                "
                                                              >
                                                                <div
                                                                  style="
                                                                    text-align: center;
                                                                  "
                                                                >
                                                                  <img
                                                                    alt="Custom"
                                                                    src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/subtleinverse/pinterest_96.png"
                                                                    style="
                                                                      width: 48px;
                                                                    "
                                                                    width="48"
                                                                  />
                                                                </div>
                                                              </div>

                                                              <div
                                                                class=""
                                                                style="
                                                                  display: inline-block;
                                                                "
                                                              >
                                                                <div
                                                                  style="
                                                                    text-align: center;
                                                                  "
                                                                >
                                                                  <img
                                                                    alt="Custom"
                                                                    src="https://d3k81ch9hvuctc.cloudfront.net/assets/email/buttons/subtleinverse/instagram_96.png"
                                                                    style="
                                                                      width: 48px;
                                                                    "
                                                                    width="48"
                                                                  />
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                          <div
                                            class="mj-column-per-100 mj-outlook-group-fix component-wrapper hlb-wrapper"
                                            style="
                                              font-size: 0px;
                                              text-align: left;
                                              direction: ltr;
                                              vertical-align: top;
                                              width: 100%;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="width: 100%"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr class="gmail-blend-screen">
                                                  <td
                                                    class="hlb-block-settings-content"
                                                    style="
                                                      background-color: #262626;
                                                      vertical-align: top;
                                                      padding-top: 5px;
                                                      padding-right: 0px;
                                                      padding-bottom: 5px;
                                                      padding-left: 0px;
                                                    "
                                                  >
                                                    <table
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      role="presentation"
                                                      style=""
                                                      width="100%"
                                                    >
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            align="top"
                                                            class="kl-header-link-bar"
                                                            style="
                                                              font-size: 0px;
                                                              padding: 0px 0px
                                                                0px 0px;
                                                              word-break: break-word;
                                                            "
                                                          >
                                                            <table
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              style="
                                                                color: #000000;
                                                                font-family: Ubuntu,
                                                                  Helvetica,
                                                                  Arial,
                                                                  sans-serif;
                                                                font-size: 13px;
                                                                line-height: 22px;
                                                                table-layout: auto;
                                                                width: 100%;
                                                                border: 0;
                                                              "
                                                              width="100%"
                                                            >
                                                              <tbody>
                                                                <tr>
                                                                  <td
                                                                    align="center"
                                                                    class="table-mobile-only hlb-logo"
                                                                    style="
                                                                      display: none;
                                                                      max-height: 0;
                                                                      mso-hide: all;
                                                                      overflow: hidden;
                                                                      width: 100%;
                                                                      padding-bottom: 10px;
                                                                    "
                                                                  >
                                                                    <table
                                                                      border="0"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      style="
                                                                        border-collapse: collapse;
                                                                        border-spacing: 0px;
                                                                      "
                                                                    >
                                                                      <tbody>
                                                                        <tr>
                                                                          <td
                                                                            style="
                                                                              width: 598px;
                                                                            "
                                                                          >
                                                                            <img
                                                                              style="
                                                                                display: block;
                                                                                outline: none;
                                                                                text-decoration: none;
                                                                                height: auto;
                                                                                width: 100%;
                                                                                background-color: transparent;
                                                                              "
                                                                              width="598"
                                                                            />
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td>
                                                                    <table
                                                                      align="center"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      class="r2-tbl"
                                                                      style="
                                                                        table-layout: fixed;
                                                                      "
                                                                    >
                                                                      <tr
                                                                        style="
                                                                          text-align: center;
                                                                        "
                                                                      >
                                                                        <td
                                                                          align="center"
                                                                          class="kl-hlb-stack block vspc hlb-subblk"
                                                                          style="
                                                                            display: inline-block;
                                                                            padding-right: 11px;
                                                                          "
                                                                          valign="middle"
                                                                        >
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            class="lnk"
                                                                            style="
                                                                              border-collapse: separate;
                                                                              line-height: 100%;
                                                                            "
                                                                          >
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                bgcolor="transparent"
                                                                                role="presentation"
                                                                                style="
                                                                                  border: none;
                                                                                  border-radius: 0px;
                                                                                  cursor: auto;
                                                                                  font-style: normal;
                                                                                  mso-padding-alt: 10px
                                                                                    10px
                                                                                    10px
                                                                                    10px;
                                                                                  background: transparent;
                                                                                "
                                                                                valign="middle"
                                                                              >
                                                                                <p
                                                                                  style="
                                                                                    padding-bottom: 0;
                                                                                    display: inline-block;
                                                                                    background: transparent;
                                                                                    color: #fff;
                                                                                    font-family: 'Helvetica Neue',
                                                                                      Arial;
                                                                                    font-size: 11px;
                                                                                    font-style: normal;
                                                                                    font-weight: 400;
                                                                                    line-height: 100%;
                                                                                    letter-spacing: 2px;
                                                                                    margin: 0;
                                                                                    text-decoration: none;
                                                                                    text-transform: none;
                                                                                    padding: 10px
                                                                                      10px
                                                                                      10px
                                                                                      10px;
                                                                                    mso-padding-alt: 0;
                                                                                    border-radius: 0;
                                                                                  "
                                                                                >
                                                                                  ABOUT
                                                                                </p>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td
                                                                          align="center"
                                                                          class="kl-hlb-stack block vspc hlb-subblk"
                                                                          style="
                                                                            display: inline-block;
                                                                            padding-right: 11px;
                                                                          "
                                                                          valign="middle"
                                                                        >
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            class="lnk"
                                                                            style="
                                                                              border-collapse: separate;
                                                                              line-height: 100%;
                                                                            "
                                                                          >
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                bgcolor="transparent"
                                                                                role="presentation"
                                                                                style="
                                                                                  border: none;
                                                                                  border-radius: 0px;
                                                                                  cursor: auto;
                                                                                  font-style: normal;
                                                                                  mso-padding-alt: 10px
                                                                                    10px
                                                                                    10px
                                                                                    10px;
                                                                                  background: transparent;
                                                                                "
                                                                                valign="middle"
                                                                              >
                                                                                <p
                                                                                  style="
                                                                                    padding-bottom: 0;
                                                                                    display: inline-block;
                                                                                    background: transparent;
                                                                                    color: #fff;
                                                                                    font-family: 'Helvetica Neue',
                                                                                      Arial;
                                                                                    font-size: 11px;
                                                                                    font-style: normal;
                                                                                    font-weight: 400;
                                                                                    line-height: 100%;
                                                                                    letter-spacing: 2px;
                                                                                    margin: 0;
                                                                                    text-decoration: none;
                                                                                    text-transform: none;
                                                                                    padding: 10px
                                                                                      10px
                                                                                      10px
                                                                                      10px;
                                                                                    mso-padding-alt: 0;
                                                                                    border-radius: 0;
                                                                                  "
                                                                                >
                                                                                  ORDERS
                                                                                </p>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td
                                                                          align="center"
                                                                          class="kl-hlb-stack block vspc hlb-subblk"
                                                                          style="
                                                                            display: inline-block;
                                                                            padding-right: 11px;
                                                                          "
                                                                          valign="middle"
                                                                        >
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            class="lnk"
                                                                            style="
                                                                              border-collapse: separate;
                                                                              line-height: 100%;
                                                                            "
                                                                          >
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                bgcolor="transparent"
                                                                                role="presentation"
                                                                                style="
                                                                                  border: none;
                                                                                  border-radius: 0px;
                                                                                  cursor: auto;
                                                                                  font-style: normal;
                                                                                  mso-padding-alt: 10px
                                                                                    10px
                                                                                    10px
                                                                                    10px;
                                                                                  background: transparent;
                                                                                "
                                                                                valign="middle"
                                                                              >
                                                                                <p
                                                                                  style="
                                                                                    padding-bottom: 0;
                                                                                    display: inline-block;
                                                                                    background: transparent;
                                                                                    color: #fff;
                                                                                    font-family: 'Helvetica Neue',
                                                                                      Arial;
                                                                                    font-size: 11px;
                                                                                    font-style: normal;
                                                                                    font-weight: 400;
                                                                                    line-height: 100%;
                                                                                    letter-spacing: 2px;
                                                                                    margin: 0;
                                                                                    text-decoration: none;
                                                                                    text-transform: none;
                                                                                    padding: 10px
                                                                                      10px
                                                                                      10px
                                                                                      10px;
                                                                                    mso-padding-alt: 0;
                                                                                    border-radius: 0;
                                                                                  "
                                                                                >
                                                                                  PRIVACY
                                                                                </p>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td
                                                                          align="center"
                                                                          class="kl-hlb-stack block vspc hlb-subblk"
                                                                          style="
                                                                            display: inline-block;
                                                                            padding-right: 11px;
                                                                          "
                                                                          valign="middle"
                                                                        >
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            class="lnk"
                                                                            style="
                                                                              border-collapse: separate;
                                                                              line-height: 100%;
                                                                            "
                                                                          >
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                bgcolor="transparent"
                                                                                role="presentation"
                                                                                style="
                                                                                  border: none;
                                                                                  border-radius: 0px;
                                                                                  cursor: auto;
                                                                                  font-style: normal;
                                                                                  mso-padding-alt: 10px
                                                                                    10px
                                                                                    10px
                                                                                    10px;
                                                                                  background: transparent;
                                                                                "
                                                                                valign="middle"
                                                                              >
                                                                                <p
                                                                                  style="
                                                                                    padding-bottom: 0;
                                                                                    display: inline-block;
                                                                                    background: transparent;
                                                                                    color: #fff;
                                                                                    font-family: 'Helvetica Neue',
                                                                                      Arial;
                                                                                    font-size: 11px;
                                                                                    font-style: normal;
                                                                                    font-weight: 400;
                                                                                    line-height: 100%;
                                                                                    letter-spacing: 2px;
                                                                                    margin: 0;
                                                                                    text-decoration: none;
                                                                                    text-transform: none;
                                                                                    padding: 10px
                                                                                      10px
                                                                                      10px
                                                                                      10px;
                                                                                    mso-padding-alt: 0;
                                                                                    border-radius: 0;
                                                                                  "
                                                                                >
                                                                                  RETURNS
                                                                                  &amp;
                                                                                  EXCHANGES
                                                                                </p>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td
                                                                          align="center"
                                                                          class="kl-hlb-stack block hlb-subblk"
                                                                          style="
                                                                            display: inline-block;
                                                                          "
                                                                          valign="middle"
                                                                        >
                                                                          <table
                                                                            border="0"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            class="lnk"
                                                                            style="
                                                                              border-collapse: separate;
                                                                              line-height: 100%;
                                                                            "
                                                                          >
                                                                            <tr>
                                                                              <td
                                                                                align="center"
                                                                                bgcolor="transparent"
                                                                                role="presentation"
                                                                                style="
                                                                                  border: none;
                                                                                  border-radius: 0px;
                                                                                  cursor: auto;
                                                                                  font-style: normal;
                                                                                  mso-padding-alt: 10px
                                                                                    10px
                                                                                    10px
                                                                                    10px;
                                                                                  background: transparent;
                                                                                "
                                                                                valign="middle"
                                                                              >
                                                                                <p
                                                                                  style="
                                                                                    padding-bottom: 0;
                                                                                    display: inline-block;
                                                                                    background: transparent;
                                                                                    color: #fff;
                                                                                    font-family: 'Helvetica Neue',
                                                                                      Arial;
                                                                                    font-size: 11px;
                                                                                    font-style: normal;
                                                                                    font-weight: 400;
                                                                                    line-height: 100%;
                                                                                    letter-spacing: 2px;
                                                                                    margin: 0;
                                                                                    text-decoration: none;
                                                                                    text-transform: none;
                                                                                    padding: 10px
                                                                                      10px
                                                                                      10px
                                                                                      10px;
                                                                                    mso-padding-alt: 0;
                                                                                    border-radius: 0;
                                                                                  "
                                                                                >
                                                                                  CONTACT
                                                                                  US
                                                                                </p>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>

                                      <div
                                        class="kl-row colstack"
                                        style="
                                          display: table;
                                          table-layout: fixed;
                                          width: 100%;
                                        "
                                      >
                                        <div
                                          class="kl-column"
                                          style="
                                            display: table-cell;
                                            vertical-align: top;
                                            width: 100%;
                                          "
                                        >
                                          <div
                                            class="mj-column-per-100 mj-outlook-group-fix component-wrapper kl-text-table-layout"
                                            style="
                                              font-size: 0px;
                                              text-align: left;
                                              direction: ltr;
                                              vertical-align: top;
                                              width: 100%;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="width: 100%"
                                              width="100%"
                                            >
                                              <tbody>
                                                <tr>
                                                  <td
                                                    class=""
                                                    style="
                                                      vertical-align: top;
                                                      padding-top: 24px;
                                                      padding-right: 0px;
                                                      padding-bottom: 24px;
                                                      padding-left: 0px;
                                                    "
                                                  >
                                                    <table
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      role="presentation"
                                                      style=""
                                                      width="100%"
                                                    >
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            align="center"
                                                            class="kl-text"
                                                            style="
                                                              font-size: 0px;
                                                              padding: 0px;
                                                              padding-top: 9px;
                                                              padding-right: 18px;
                                                              padding-bottom: 9px;
                                                              padding-left: 18px;
                                                              word-break: break-word;
                                                            "
                                                          >
                                                            <div
                                                              style="
                                                                font-family: 'Helvetica Neue',
                                                                  Arial;
                                                                font-size: 10px;
                                                                font-style: normal;
                                                                font-weight: 400;
                                                                letter-spacing: 1px;
                                                                line-height: 1.3;
                                                                text-align: center;
                                                                color: #727272;
                                                              "
                                                            >
                                                              <p
                                                                style="
                                                                  padding-bottom: 0;
                                                                "
                                                              >
                                                                No longer want
                                                                to receive these
                                                                emails? {% unsubscribe %}.<br />
                                                                {{ organization.name }} {{ organization.full_address }}
                                                              </p>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>

`;
}

function generateProductMarkup(product: Product): string {
  return `
<div class="kl-product" style="display: table; width: 100%; height: 100%">
  <div
    class=""
    style="display: table-cell; vertical-align: top; font-size: 0; width: 100%"
  >
    <table
      cellpadding="0"
      cellspacing="0"
      height="100%"
      role="presentation"
      width="100%"
    >
      <tbody>
        <tr>
          <td
            style="
              font-size: 0px;
              padding: 30px 10px 30px 10px;
              word-break: break-word;
              vertical-align: top;
            "
          >
            <table
              align="left"
              border="0"
              cellpadding="0"
              cellspacing="0"
              class="kl-product-subblock"
              style="table-layout: fixed; height: 100%"
              width="100%"
            >
              <tbody>
                <tr>
                  <td align="center">
                    <a
                      href="${product.url}"
                      style="
                        color: #15c;
                        font-style: normal;
                        font-weight: normal;
                        text-decoration: underline;
                      "
                    >
                      <img
                        alt="Image of ${product.name}"
                        src="${product.imageUrl}"
                        style="
                          display: block;
                          max-width: 100%;
                          width: auto;
                          max-height: 240px;
                        "
                        width="176"
                      />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table align="center">
                      <tr>
                        <td
                          align="center"
                          style="
                            color: #000000;
                            font-family: 'Helvetica Neue', Arial;
                            font-size: 14px;
                            font-weight: 400;
                            font-style: normal;
                            text-align: center;
                            letter-spacing: 1px;
                            padding-top: 5px;
                            padding-bottom: 0px;
                            line-height: 1.3;
                          "
                        >
                          ${product.name}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="height: 100%"></td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 9px">
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      style="border-collapse: separate; line-height: 100%"
                    >
                      <tr>
                        <td
                          align="center"
                          role="presentation"
                          class="gmail-blend-screen"
                          style="
                            border: none;
                            border-radius: 100px;
                            cursor: auto;
                            font-style: normal;
                            mso-padding-alt: 10px 20px 10px 20px;
                            text-align: center;
                          "
                          valign="middle"
                        >
                          <a
                            href="${product.url}"
                            style="
                              color: #fff;
                              font-style: normal;
                              font-weight: 400;
                              text-decoration: none;
                              display: inline-block;
                              background: #262626;
                              font-family: Arial;
                              font-size: 16px;
                              line-height: 1.3;
                              letter-spacing: 1px;
                              margin: 0;
                              text-transform: none;
                              padding: 10px 20px 10px 20px;
                              mso-padding-alt: 0;
                              border-radius: 100px;
                            "
                            target="_blank"
                          >
                            Shop now
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
`;
}
