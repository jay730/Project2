module.exports = function(sequelize, DataTypes) {
  var places = sequelize.define(
    "places",
    {
      id: {
        type: DataTypes.INTEGER(15),
        primaryKey: true
      },
      CityId: DataTypes.STRING(45),
      CityName: DataTypes.STRING(45),
      CountryName: DataTypes.STRING(100),
      IataCode: DataTypes.STRING(6),
      Name: DataTypes.STRING(20),
      PlaceId: DataTypes.INTEGER(20),
      SkyscannerCode: DataTypes.STRING(20),
      Type: DataTypes.STRING(20)
    },

    {
      timestamps: false,
      tableName: "places"
    }
  );

  return places;
};
