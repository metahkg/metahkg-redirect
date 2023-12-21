export interface UrlHausThreat {
  id: string;
  dateadded: string;
  url: string;
  url_status: "online" | "offline";
  last_online: string;
  threat: string;
  tags: string;
  urlhaus_link: string;
  reporter: string;
}
