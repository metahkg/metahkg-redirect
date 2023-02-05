export interface UrlHausThreat {
  id: string;
  dateadded: string;
  url: string;
  url_status: "online" | "offline";
  threat: string;
  tags: string;
  urlhaus_link: string;
  reporter: string;
}
