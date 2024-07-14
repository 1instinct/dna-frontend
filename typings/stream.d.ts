export interface IStream {
  id: number;
  title: string;
  description: string;
  stream_url: string;
  stream_key: string;
  stream_id: string;
  playback_ids: string[];
  status: string;
  start_date: number;
  is_active: true;
  product_ids: number[];
}
