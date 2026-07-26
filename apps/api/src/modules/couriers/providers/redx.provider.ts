import { BaseCourierProvider } from "./base.provider.js";

export class RedXProvider extends BaseCourierProvider {
  readonly slug = "redx" as const;
  readonly name = "RedX";
  protected requiredCredentialKeys = ["apiKey", "secret", "storeId"];
}
