import { httpError } from "../utility/httpUtility";
import logger from "../utility/logger";

class BasicService {
  protected toSafe(doc: any) {
    try {
      if (!doc) return doc;
      const { _id, __v, ...rest } = doc;
      return { id: _id.toString(), ...rest };
    } catch {
      logger.error("[BasicService] Something went wrong converting _id to id");
      httpError(500, "An internal server error occured");
    }
  }

  protected toSafeArray(docs: any[]) {
    try {
      return docs.map((d) => this.toSafe(d));
    } catch {
      logger.error(
        "[BasicService] Something went wrong converting each object's _id to id",
      );
      httpError(500, "Something went wrong in [BasicService] toSafeArray");
    }
  }
}

export { BasicService };
