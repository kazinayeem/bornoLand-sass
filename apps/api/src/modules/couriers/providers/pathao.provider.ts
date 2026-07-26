import { BaseCourierProvider } from "./base.provider.js";

export class PathaoProvider extends BaseCourierProvider {
  readonly slug = "pathao" as const;
  readonly name = "Pathao";
  protected requiredCredentialKeys = ["clientId", "clientSecret", "username", "password", "storeId"];
}
