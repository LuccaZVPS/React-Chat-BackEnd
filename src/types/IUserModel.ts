export interface IUserModel {
  username: string;
  withGoogle: boolean;
  email: string;
  hashedPassword?: string;
  friends?: string[];
  requests?: string[];
  avatar?: string;
  isUsingAvatar: boolean;
  id: string;
}
