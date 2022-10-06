class APIFeatures {
  constructor(query, queryStringObj) {
    this.query = query;
    this.queryStringObj = queryStringObj;
  }

  filter() {
    // @1 FILTERING
    // querying the db for data that satisfy a specific data condition
    //{duration : 4, price:699}

    let queryObj = { ...this.queryStringObj };
    const excludedFields = ["limit", "sort", "page", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCE FLITERING
    // specifying data ranges
    // {duration:7 , price:{$gt:677}}

    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryObj);
    this.query.find(queryObj);
    return this;
  }

  sort() {
    if (this.queryStringObj.sort) {
      let sortBy = this.queryStringObj.sort;
      sortBy = sortBy.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
      this.query.sort("createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryStringObj.fields) {
      let { fields } = this.queryStringObj;
      fields = fields.split(",").join(" ");
      this.query.select(fields);
    } else {
      this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    // @4 PAGINATION
    const page = this.queryStringObj.page * 1 || 1;
    const limit = this.queryStringObj.limit * 1 || 30;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
