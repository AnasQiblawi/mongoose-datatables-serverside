/**
 * Create a query for server-side DataTables using Mongoose.
 * for www.datatables.net
 *
 * @param {mongoose.Model} model - The Mongoose model to query.
 * @param {Object} queryOptions - Options for configuring the query.
 * @param {number} queryOptions.draw - DataTables draw counter for response identification.
 * @param {number} queryOptions.start - Index of the first record to retrieve.
 * @param {number} queryOptions.length - Number of records to retrieve.
 * @param {Object} queryOptions.search - DataTables search object.
 * @param {Array} queryOptions.order - DataTables order object.
 * @param {Array} queryOptions.columns - DataTables column definitions.
 * @param {Array} queryOptions.populate - Mongoose population options.
 * @param {Object} queryOptions.find - Additional find criteria for the query.
 * @param {Object} additionalQueryOptions - Additional filter criteria to merge with the find criteria.
 * @returns {Promise<Object>} - A promise that resolves to a DataTables-compatible response object.
 */
module.exports = async (model, queryOptions, additionalQueryOptions) => {

  const {
    draw = 0,
    start = 0,
    length = 0,
    search = {},
    order = [],
    columns = [],
    populate = [],
    find = {},
  } = queryOptions;

  // Search Query
  const findQuery = { ...find, ...additionalQueryOptions };

  // Find
  let query = model.find(findQuery);

  // Populate
  query.populate(populate);

  // General Search (OR)
  // Search in all columns
  if (search?.value) {
    let searchValueDataType = typeof search?.value;
    if (!isNaN(search?.value)) searchValueDataType = 'number';

    const searchValue = search?.regex ? new RegExp(search?.value, 'ig') : search?.value;
    const searchableFields = columns
      .filter((col) => JSON.parse(col.searchable))
      .map((col) => col.data);

    // Determine the data type of each searchable field
    const dataTypeMap = {};
    model.schema.eachPath((path, schemaType) => {
      if (searchableFields.includes(path)) {
        dataTypeMap[path] = schemaType.instance;
      }
    });

    // Build a filter for each searchable field
    const searchFilter = searchableFields.reduce((filter, field) => {
      const dataType = dataTypeMap[field];
      if (dataType === 'String') {
        filter[field] = searchValue;
      } else if (dataType === 'Number' && searchValueDataType === 'number') {
        // Handle numeric fields differently (you can adjust as needed)
        filter[field] = search?.value;
      } else if (dataType === 'Date' && searchValueDataType === 'date') {
        // Handle date fields differently (you can adjust as needed)
        filter[field] = { $gte: new Date(search?.value) };
      }
      return filter;
    }, {});

    // Combine filter conditions with OR
    let generalSearchValuesFilter = Object.keys(searchFilter).map((key) => ({
      [key]: searchFilter[key],
    }));
    console.log(generalSearchValuesFilter)
    query.or(generalSearchValuesFilter);
  }

  // Specific Columns Filter (AND)
  const columnSearch = columns.filter((col) => col?.search?.value);
  if (columnSearch.length) {
    const columnsSearchesFilter = [];
    columnSearch.forEach((col) => {
      const searchValue = col.search?.regex ? new RegExp(col.search.value, 'ig') : col.search.value;
      columnsSearchesFilter.push({ [col.data]: searchValue });
    });

    // Apply search filter to the query using AND
    query.and(columnsSearchesFilter);
  }

  // Sorting - Multi-Column
  if (order && order.length) {
    let sortCriteria = {};
    order.forEach((columnOrder) => {
      const { column, dir } = columnOrder;
      const columnKey = columns[column].data;
      const sortDirection = dir === 'asc' ? 1 : -1;
      sortCriteria[columnKey] = sortDirection;
    });
    // Apply sorting
    query.sort(sortCriteria);
  } else query.sort({ _id: -1 });



  // Apply pagination
  const records = await query.skip(parseInt(start)).limit(parseInt(length)).exec();

  // Total records count
  const totalRecords = await model.countDocuments(findQuery);

  return {
    draw: draw,
    recordsTotal: totalRecords,
    recordsFiltered: totalRecords, // Total records after filtering (in this case, the same as totalRecords)
    data: records,
  };
};