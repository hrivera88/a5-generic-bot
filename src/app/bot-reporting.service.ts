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
    cookieid,
    alive5_org_name
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
        event_content: encodeURIComponent(event_content),
        cookieid: cookieid,
        browser_type: browser_type,
        alive5_org_name: alive5_org_name
      }
    });
  }
}
