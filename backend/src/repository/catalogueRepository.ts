class CatalogueRepository {
  public async findById() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CatalogueRepository] findById failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findAll() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CatalogueRepository] findAll failed: ${err?.message ?? err}`,
      );
    }
  }

  public async create() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CatalogueRepository] create failed: ${err?.message ?? err}`,
      );
    }
  }

  public async update() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CatalogueRepository] update failed: ${err?.message ?? err}`,
      );
    }
  }

  public async delete() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CatalogueRepository] delete failed: ${err?.message ?? err}`,
      );
    }
  }
}

export { CatalogueRepository };
