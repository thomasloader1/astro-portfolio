export interface TagsProps{
    [key: string]: {
    name: string;
    class: string;
    icon: (_props: Record<string, any>) => any;
  };
}