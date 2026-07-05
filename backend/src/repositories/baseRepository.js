export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(data) {
    return this.model.create(data);
  }

  findById(id, projection) {
    return this.model.findById(id, projection);
  }

  findOne(filter, projection) {
    return this.model.findOne(filter, projection);
  }

  find(filter = {}, options = {}) {
    const query = this.model.find(filter);
    if (options.populate) query.populate(options.populate);
    if (options.sort) query.sort(options.sort);
    if (options.limit) query.limit(options.limit);
    return query;
  }

  updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}
