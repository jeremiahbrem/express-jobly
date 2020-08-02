const sqlForPartialUpdate = require('../../helpers/partialUpdate.js');

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
        let table = 'testTable';
        let items = {'column1': 'update1'};
        let key = 'testKey';
        let id = 'testId';
  
    expect(sqlForPartialUpdate(table, items, key, id)).toEqual({
      query: 'UPDATE testTable SET column1=$1 WHERE testKey=$2 RETURNING *',
      values: ['update1', 'testId']
    });

  });
});