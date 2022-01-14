var $$ = Dom7;

var device = Framework7.getDevice();
var app = new Framework7({
  name: 'MyApp', // App name
  theme: 'auto', // Automatic theme detection
  el: '#app', // App root element

  id: 'io.framework7.myapp', // App bundle ID
  // App store
  store: store,
  // App routes
  routes: routes,


  // Input settings
  input: {
    scrollIntoViewOnFocus: device.cordova && !device.electron,
    scrollIntoViewCentered: device.cordova && !device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;

      $$(document).on('page:afterin', function (e, page) {
        if(!localStorage.username) {
            page.router.navigate('/login/');
        }
      });


      $$(document).on('page:init', function (e, page) {  
        
          app.request.post("http://localhost:8000/f7makanan/foodlist.php", {},
              function(data) {   
               // app.dialog.alert('Username atau password salah'); 
                var arr = JSON.parse(data); 
                var result = arr['result'];
                  
                if( result == 'success')
                {
                  $$("#rowresep").html("");
                  resep=arr['data'];
                  for(var i=0; i < resep.length; i++) 
                  {
                    $$("#rowresep").append(
                      "<div class='col-50'><div class='card' style='margin:3px'>" +
                      "<div class='card-header'>"+ resep[i]["name"] +
                      "</div><div class='card card-content'>"+
                      "<a href='/detailrecipes/" + resep[i]['id'] + "'>" +
                      "<img src='http://ubaya.fun/hybrid/160419072/img/"+ resep[i]["id"] + ".jpg' width='100%' height='100%'></a>" + 
                      "</div></div></div>");              
                  }
                } 
                else 
                {
                  app.dialog.alert(arr['message']); 
                }             
          });
         
          $$('#btncari').on('click', function () {
          var cari = $$('#txtcari').val();

          app.request.post("http://localhost:8000/f7makanan/foodlist.php", 
            {"cari": cari} ,
            function(data) { 
              //app.dialog.alert($$("#txtcari").val()); 
              var arr = JSON.parse(data); 
              if(arr['result'] == "success")
              {
                //app.dialog.alert($$("#txtcari").val());
                $$("#rowresep").html("");
                resep=arr['data'];
                for(var i=0; i < resep.length; i++) 
                {
                   $$("#rowresep").append(
                    "<div class='col-50'><div class='card' style='margin:3px'>" +
                      "<div class='card-header'>"+ resep[i]["name"] +
                      "</div><div class='card card-content'>"+
                      "<a href='/detailrecipes/" + resep[i]['id'] + "'>" +
                      "<img src='http://localhost:8000/f7makanan/img/"+ resep[i]["id"]  + ".jpg' width='100%' height='100%'></a>"+ 
                      "</div></div></div>");
                }
              } 
              else 
              {
                app.dialog.alert(arr['message']); 
              }
          });
        });
        

        if (page.name == "login") {

          localStorage.removeItem("username")

          $$('#btnsignin').on('click', function() {
            app.request.post('http://localhost:8000/f7makanan/login.php',
              { "username":$$("#username").val(),
              "password":$$("#password").val() } ,
              function (data) {
                var arr = JSON.parse(data);
                var result=arr['result'];
                if(result=='success')
                { 
                  localStorage.username = $$("#username").val();
                  page.router.back('/'); 
                }
                else app.dialog.alert('Username atau password salah');
            });
          });
        }
        

        if(page.name=="addrecipes"){
            $$('#btnsubmit').on('click', function() {
              app.request.post('http://localhost:8000/f7makanan/addrecipes.php',
                { 
                  "name":$$("#name").val(), "material":$$("#material").val(), "making":$$("#making").val(), "description":$$("#description").val() 
                } ,
                function (data) {
                var arr = JSON.parse(data);
                var result=arr['result'];
                if(result=='success'){
                app.dialog.alert('successfully add data');
                  app.view.main.router.navigate('/',
                  {
                    reloadCurrent: true,
                    pushState: false
                  });
                }
                else app.dialog.alert('failed to add data');
                });
              
              });
        }

        if(page.name == "detailrecipes") {
          var id = page.router.currentRoute.params.id;
          var user_id = localStorage.username;
          app.request.post("http://localhost:8000/f7makanan/detailrecipes.php",
          { "id": id },
                function(data) {
                    var arr = JSON.parse(data);
                    resep = arr['data']; 
                    

                    $$('#pagedetail').html(
                      "<div class='card'>"+
                      "<div class='card-header'>"+ resep["name"] +
                      "<a href='/editdetail/"+resep['id']+"'>EDIT</a> </div><div class='card-content'>" +
                      "<img src='http://localhost:8000/f7makanan/img/"+ resep["id"] + ".jpg' width='100%'>"+
                      "<br><div class='block'><h2>Material:</h2><p>" + resep["material"] +"</p><h2>Making :</h2><p>"+
                      resep["making"] + "</p><h2>Description :</h2><p>"+
                      resep["description"] +"</p>" + "<h2>Komentar : </h2><p id='commentresep'></p>");


                    comment = resep['comment'];
                   
                    

                    for(i=0; i < comment.length; i++)
                    {
                      $$("#commentresep").append("<b>" + comment[i]['username'] + " : </b>  " + comment[i]["isi_comment"]+"<br>"); 
                      
                    }
                    $$("#commentresep").append("<br><div class='item-input-wrap'>"+
                                                "<textarea id='comment'name='comment' placeholder='add comment'"+
                                                    "rows='1'></textarea>"+
                                                "<span class='input-clear-button'></span>"+
                                                "</div>" + "<br><div class='item-inner'>"+
                                                "<input type='button' name='submit' id='submit'" +
                                                "class='button button-fill button-big' value='COMMENT'>" +
                                                "</div>"+"<br><div class='item-inner'>"+
                                                "<input type='button' name='submitdelete' id='submitdelete'" +
                                                "class='button button-fill button-big' value='DELETE'>" +
                                                "</div><br>");
                    $$('#submit').on('click', function() {
                        var username = user_id;
                        var comments = $$("#comment").val();
                        var food_id = id;
                      app.request.post('http://localhost:8000/f7makanan/comment.php',
                        { 
                          "username":username, "comments":comments, "food_id":food_id 
                        } ,
                        function (data) {
                        var arr = JSON.parse(data);
                        var result=arr['result'];
                        if(result=='success'){
                        app.dialog.alert('successfully add data');
                          app.view.main.router.navigate('/detailrecipes',
                          {
                            reloadCurrent: true,
                            pushState: false
                          });
                        }
                        else app.dialog.alert('failed to add data');
                        });
                      
                      });

                    $$('#submitdelete').on('click', function() {
                        app.request.post('http://localhost:8000/f7makanan/deletefood.php',
                          { "id":id } ,
                          function (data) {
                          var arr = JSON.parse(data);
                          var result=arr['result'];
                          if(result=='success'){
                          app.dialog.alert('successfully delete data');
                            app.view.main.router.navigate('/',
                            {
                              reloadCurrent: true,
                              pushState: false
                            });
                          }
                          else app.dialog.alert('successfully delete data');
                          });
                        
                        });
                    
          });
          

        } 
        if(page.name=="editdetail"){
          var id = page.router.currentRoute.params.id;
          var user_id = localStorage.username;

          app.request.post("http://localhost:8000/f7makanan/editfood.php",
          { "id": id },
                function(data) {
                    var arr = JSON.parse(data);
                    resep = arr['data']; 
                    
            $$('#editdetail').html("<div class='list no-hairlines-md'>"+
                                "<ul>"+
                                    "<li class='item-content item-input'>"+
                                        "<div class='item-inner'>"+
                                            "<div class='item-title item-floating-label'>FOOD NAME</div>"+
                                            "<div class='item-input-wrap'>"+
                                                "<input id='name' type='text'"+
                                                    "placeholder='"+ resep['name']+"' required />"+
                                                "<span class='input-clear-button'></span>"+
                                            "</div>"+
                                        "</div>"+
                                    "</li>"+

                                    "<li class='item-content item-input'>"+
                                        "<div class='item-inner'>"+
                                            "<div class='item-title item-floating-label'>MATERIAL</div>"+
                                            "<div class='item-input-wrap'>"+
                                                "<textarea id='material' placeholder='"+ resep['material']+"'"+
                                                    "rows='10'></textarea>"+
                                                "<span class='input-clear-button'></span>"+
                                            "</div>"+
                                        "</div>"+
                                    "</li>"+

                                    "<li class='item-content item-input'>"+
                                        "<div class='item-inner'>"+
                                            "<div class='item-title item-floating-label'>MAKING</div>"+
                                            "<div class='item-input-wrap'>"+
                                                "<textarea id='making' placeholder='"+ resep['making']+"'"+
                                                    "rows='10'></textarea>"+
                                                "<span class='input-clear-button'></span>"+
                                            "</div>"+
                                        "</div>"+
                                    "</li>"+
                                    "<li class='item-content item-input'>"+
                                        "<div class='item-inner'>" +
                                            "<div class='item-title item-floating-label'>DESCRIPTION</div>"+
                                            "<div class='item-input-wrap'>"+
                                                "<textarea id='description' placeholder='"+ resep['description']+"'"+
                                                    "rows='10'></textarea>"+
                                                "<span class='input-clear-button'></span>"+
                                            "</div>"+
                                        "</div>"+
                                    "</li>"+
                                    

                                   
                                    "<li class='item-content item-input'>"+
                                        "<div class='item-inner'>"+
                                            "<input type='button' name='btnsubmit' id='btnsubmit'"+
                                                "class='button button-fill button-big' value='Submit'>"+
                                        "</div>"+
                                    "</li>"+

                                "</ul>"+
                            "</div>");

            $$('#btnsubmit').on('click', function() {
              var id = page.router.currentRoute.params.id;
              app.request.post('http://localhost:8000/f7makanan/editrecipes.php',
                { 
                  "id":id,"name":$$("#name").val(), "material":$$("#material").val(), "making":$$("#making").val(), "description":$$("#description").val() 
                } ,
                function (data) {
                var arr = JSON.parse(data);
                var result=arr['result'];
                if(result=='success'){
                app.dialog.alert('successfully update data');
                  app.view.main.router.navigate('/',
                  {
                    reloadCurrent: true,
                    pushState: false
                  });
                }
                else app.dialog.alert('failed to add data');
                });
              
              });
          });
          
        }   

        
      



      });



      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
        cordovaApp.init(f7);
      }
    },
  },
});