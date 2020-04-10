import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-qr-auth',
  templateUrl: './qr-auth.component.html',
  styles: []
})
export class QrAuthComponent implements AfterViewInit {

  constructor() { }


  ngAfterViewInit() {
    this.d({
      "id": "wx_reg",
      "appid": "wxe6b54b37370b2706",
      "agentid": "1000005",
      "redirect_uri": "http%3a%2f%2fkpi.cdtfhr.com",
      "state": "",
      "href": "",
    });
  }
  d(c, a = window, b = document) {
    var d = b.createElement("iframe");
    var e = "https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=" + c.appid + "&agentid=" + c.agentid + "&redirect_uri=" + c.redirect_uri + "&state=" + c.state + "&login_type=jssdk";
    e += c.style ? "&style=" + c.style : "",
      e += c.href ? "&href=" + c.href : "",
      d.src = e,
      d.frameBorder = "0",
      // d.allowTransparency = "true",
      d.scrolling = "no",
      d.width = "300px",
      d.height = "400px";
    var f = b.getElementById(c.id);
    f.innerHTML = "",
      f.appendChild(d),
      d.onload = function () {
        a.addEventListener("message", function (b) {
          b.data && b.origin.indexOf("work.weixin.qq.com") > -1 && (a.location.href = b.data)
        }),
          d.contentWindow.postMessage("ask_usePostMessage", "*")
      }
  }
}