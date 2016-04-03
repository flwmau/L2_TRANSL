'use strict';

var count = 144; //счетчик для хт
var MAX_SIZE_HASH_TABLE = 366;
var NO_DATA = "Нет данных";
var EMPTY = "Пусто";
var LEX_ERROR = "ERROR";
var EXCEPTION = "EXCEPTION";
var pointer = 0;//указатель на первую свободную ячейку ТИ
var commentCount = 0;
var comment = "";
var tq = false;
var lastFindElement = "";
var lexAnalys = false;
var bracketOpen = 0;
var bracketClose = 0;


var app = angular.module("myApp", []).controller("mainController", function($scope){
  $scope.htText = "Значение ХТ";
  $scope.addressText = "Адрес";
  $scope.hashTableTitle = "ХТ";
  $scope.idTableTitle = "ТИ";
  $scope.valueText = "Значение";
  $scope.leftLink = "Левая ссылка";
  $scope.rightLink = "Правая ссылка";
  $scope.inputSet = "Ввод";
  $scope.errorString = "";
  $scope.hash_table = []; //$scope.hash_table = [{value:count+++"", address:'tyty'}];
  $scope.id_table = [];   //{address:"", id:"", leftLink:"", rightLink:""}
  $scope.lexema_table = [];

  //заполнение хэш-таблицы
  for (var i = count; i < MAX_SIZE_HASH_TABLE + 1; i++) {
    $scope.hash_table.push({value: i, address: NO_DATA});
  }

  $scope.addId = function(){
    tq = false;
    //хэшируем
    var hash = hash_function($scope.idText);
    $scope.hash_value = hash;
    //если в ХТ по хэшу пусто, то добавляем элемент в ТИ а в ХТ ссылку на адрес в ТИ
    if($scope.hash_table[hash-144].address == NO_DATA){
      $scope.hash_table[hash-144].address = pointer;
      $scope.id_table.push(
          {address:pointer, id:$scope.idText, leftLink:EMPTY, rightLink:EMPTY}
      );
      pointer++;
    }
    else{
      //получаю ссылку на ТИ где хранится элемент с таким же хэшом
      var link = $scope.hash_table[hash - 144].address;
      //беру идентификатор из ТИ для сравнения
      var identifier = $scope.id_table[link]; console.log(identifier);
      
      while(true){
        if ($scope.idText.localeCompare(identifier.id) == 0) {
          console.log($scope.idText + " " + identifier.id);
          if(!lexAnalys) {
            alert("Дублирование элементов");
          }
          break;
        }
        if ($scope.idText.localeCompare(identifier.id) == 1) {
          console.log("rightLink");
          if(identifier.rightLink == EMPTY) {
            $scope.id_table[identifier.address].rightLink = pointer;
            $scope.id_table.push(
                {address: pointer, id: $scope.idText, leftLink: EMPTY, rightLink: EMPTY}
            );
            pointer++;
            break;
          }
          else{
            identifier = $scope.id_table[identifier.rightLink];
            console.log(identifier);
          }
        }
        if($scope.idText.localeCompare(identifier.id) == -1){
          console.log("leftLink");
          if(identifier.leftLink == EMPTY){
            console.log("leftLink is empty");
            $scope.id_table[identifier.address].leftLink = pointer;
            $scope.id_table.push(
                {address:pointer, id: $scope.idText, leftLink:EMPTY, rightLink: EMPTY}
            );
            pointer++;
            break;
          }
          else{
            identifier = $scope.id_table[identifier.leftLink];
          }
        }
      }      
    }
    $scope.idText = "";
  }

  $scope.searchId = function(){
    //реализовать поиск
    //$scope.findId // идентификатор, который нужно найти
    var hash = hash_function($scope.findId);
    $scope.hash_value = hash;
    if($scope.hash_table[hash-144].address == NO_DATA){
      alert("Элемент не найден.");
      $scope.findId = "";
      return;
    }
    else{
      var j = 0;
      var link = $scope.hash_table[hash - 144].address;
      //беру идентификатор из ТИ для сравнения
      var identifier = $scope.id_table[link]; console.log(identifier);
      while(true){
        if($scope.findId.localeCompare(identifier.id) == 0){
          $scope.findCount = "Элемент найден за "+(++j)+" "+getOutputText(j) + "Адрес в ТИ: "+identifier.address;
          lastFindElement = identifier.address;
          break;
        }
        if($scope.findId.localeCompare(identifier.id) == 1){
          if(identifier.rightLink == EMPTY){
            $scope.findCount = "Элемент не найден";
            break;
          }
          else{
            j++;
            console.log("rightLink " + identifier.rightLink);
            identifier = $scope.id_table[identifier.rightLink];
          }
        }
        if($scope.findId.localeCompare(identifier.id) == -1){
          if(identifier.leftLink == EMPTY){
            $scope.findCount = "Элемент не найден";
            break;
          }
          else{
            j++;
            console.log("leftLink " + identifier.leftLink);
            identifier = $scope.id_table[identifier.leftLink];
          }
        }
      }
    }
    $scope.findId = "";
    return identifier.address;
  }
  $scope.analysis = function(){
    bracketClose = 0;
    bracketOpen = 0;
    $scope.errorString = "";
    tq = true;
    // regexp for scope
    // ["(scope)", "(s p q)"]
    // [\(]{1}[a-zA-Z0-9\s\:\=\;]{1,}[\)]{1}/g


    var mainRegExp = /:=|[()]|xor|and|or|not|;|\/\*[a-zA-Z\-]{1,}\*\/|[a-zA-Z0-9]*|[0-9]+[a-fA-F]*/g;
    var lexemaList = $scope.searchString.match(mainRegExp);
    var lexemaList = lexemaList.filter(function(string){ return string != "";});
    console.log(lexemaList.length + " probList " + $scope.searchString.split(/\s/).length);
    console.log(lexemaList);
    console.log($scope.searchString.split(/\s/));
    var property;
    if(lexemaList.length != $scope.searchString.split(/\s/).length){
      $scope.errorString = "Ошибка";
      return;
    }
    lexemaList.forEach(function(item, i, lexemaList){
      property = kAuto(item);
      if(i == lexemaList.length-1) {
        if (bracketOpen != bracketClose) {
          $scope.errorString = LEX_ERROR;
          return;
        }
      }
      if(property != LEX_ERROR){
        $scope.lexema_table.push(property);
      }
      else{
        $scope.errorString = property;
        return;
      }
    });
  }

  function kAuto(lex){
    console.log("kAuto("+lex+")");
    //xor and or not +
    //;              +
    //:=             +
    // 16ричные числа с 0-9abcdef +
    // /*комментарий*/ -
    // идентификаторы +
    //(скобки) +

    if((lex == "xor")||(lex == "or")||(lex == "and")||(lex == "not")){
      return {lexema: lex, type: "Логический оператор", value: "LO"};
    }
    if(lex == ";"){
      return {lexema: lex, type: "Точка с запятой", value: "TZ"};
    }
    if(lex == ":="){
      return {lexema: lex, type: "Присваивание", value: "PR"};
    }
    if(/^[0-9]+[a-fA-F\d]*$/.test(lex)){
      return {lexema: lex, type: "Шестнадцатиричное число", value: "0x"+lex};
    }
    if(/^\/\*[a-zA-Z\-]{1,}\*\/$/.test(lex)){
      return {lexema: lex, type: "Комментарий", value: "COM"};
    }
    if(/^[A-Za-z]+[0-9]*$/.test(lex)){
      lexAnalys = true;
      $scope.idText = lex;
      $scope.addId();
      lexAnalys = false;
      $scope.findId = lex;
      $scope.searchId();
      $scope.findCount = "";
      $scope.findId = "";
      return {lexema: lex, type: "Идетификатор", value: lastFindElement};
    }
    if(lex == "("){
      bracketOpen++;
      return {lexema: lex, type: "Скобка", value: "SCP"};
    }
    if(lex == ")"){
      bracketClose++;
      return {lexema: lex, type: "Скобка", value: "SCP"};
    }
    return LEX_ERROR;

  }

  $scope.clearLexTable = function(){
    location.reload();
  }

  $scope.autoGenerate = function(){
    console.log("autoGenerate");
    var n = $scope.idSize;
    var genId = "";
    for(var i=0;i<n;i++){
      var length = getRandomInt(1,10);
      for(var j = 0;j<length;j++){
        var asciiCode = getRandomInt(48,122);
        while(!((asciiCode>47)&&(asciiCode<58)||
              (asciiCode>64)&&(asciiCode<91)||
              (asciiCode>96)&&(asciiCode<123))){
          asciiCode = getRandomInt(48,122);
        }
        genId += String.fromCharCode(asciiCode);
      }
      $scope.idText = genId;
      $scope.addId();
      genId = "";
    }
  }

  function ord( str ){
    var ch = str.charCodeAt(0);
    if (ch>0xFF) ch-=0x350;
    return ch;
  }
  function hash_function(value){
    if(value.length == 1){
      return ord(value)+ord(value)+ord(value);
    }
    if(value.length == 2){
      return ord(value.charAt(0))+ord(value.charAt(1))+ord(value.charAt(1));
    }
    var middle = (value.length/2) >> 0;
    return ord(value.charAt(0))+ord(value
            .charAt(value.length-1))+ord(value.charAt(middle));
  }
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  function getOutputText(pathCount){
    if(pathCount%10 == 1){
      return "шаг";
    }
    if((pathCount>10)&&(pathCount<21)){
      return "шагов";
    }
    if((pathCount%10>4)&&(pathCount%10<9)){
      return "шагов";
    }
    if((pathCount%10>1)&&(pathCount%10<5)){
      return "шага";
    }
  }

  $scope.hf = function() {
    var value = $scope.idText;
    if ((value == undefined) || (!isNaN(value))) return "";
    if (value.length == 1) {
      return ord(value) + ord(value) + ord(value);
    }
    if (value.length == 2) {
      return ord(value.charAt(0)) + ord(value.charAt(1)) + ord(value.charAt(1));
    }
    var middle = (value.length / 2) >> 0;
    return ord(value.charAt(0)) + ord(value
            .charAt(value.length - 1)) + ord(value.charAt(middle));

  }
  $scope.saveToCookie = function(){
    for(var i=0;i<$scope.id_table.length;i++){
      document.cookie = "id"+i+"="+$scope.id_table[i].id;
    }
  }
});
