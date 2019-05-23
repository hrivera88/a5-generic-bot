import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class BotReportingService {
  constructor(private http: HttpClient) {}

  sendToReportingAPI(
    action,
    objectref,
    groupid,
    websiteid,
    client_ip,
    event_direction,
    event_type,
    event_content,
    browser_type,
    cookie_id
  ) {
    return this.http.get("https://api-v1-dev0.websitealive.com/alive5/", {
      params: {
        action: action,
        objectref: objectref,
        groupid: groupid,
        websiteid: websiteid,
        client_ip: client_ip,
        event_direction: event_direction,
        event_type: event_type,
        event_content: event_content,
        cookie_id: cookie_id,
        browser_type: browser_type
      }
    });
  }
}
