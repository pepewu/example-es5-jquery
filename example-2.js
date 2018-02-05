(function($){

window.nazwaProjektu = {
    init: function () {
        this.b = $('body');
        this.w = $(window);
        this.page = window._nazwaProjektu.page;

        this.ismobile = window._nazwaProjektu.isMobile;
        this.navLinks = $('.floatingNav a').add('.pageNav ul a');

        this.b.addClass('loaded');

        this.navigation();
        this.portfolioItems();
        this.pageInOut();

        this.scrolling = false;

        if (this.page == 'home') {
            this.homepage();
            this.homeParallax();
            this.clientsMagicList();
            this.floatingNav2();
            this.googlemap();
            this.waypoints();
        }

        if (this.page == 'project') {
            this.projectPage();
        }
    },

    navigation: function () {
        var self = this,
            colorSwitch,
            navel = $('.pageNav'),
            colorInterval;

        colorSwitch = function () {
            var i = 2;
            colorInterval = setInterval(function () {
                navel.attr('class', 'pageNav color-' + i);
                i++;

                if (i === 5) {
                    i = 1
                }
            }, 3500);
        }

        $('.navi-trigger').on('click', function (e) {
            e.preventDefault();
            if (! self.b.hasClass('navigation-is-open')) {
                self.b.addClass('navigation-is-open');
                colorSwitch();
            } else {
                self.b.removeClass('navigation-is-open');
                clearInterval(colorInterval);
            }
        });

        self.navLinks.on('click', function (e) {
            var offset = 62,
                me = $(this);

            if (me.attr('href').slice(0, 4) === 'http') {
                return
            }

            e.preventDefault();

            if (me.attr('href') == '#work') {
                offset = 0;
            }

            self.scrolling = true;
            self.b.removeClass('navigation-is-open');
            self.navLinks.removeClass('current');
            me.addClass('current');

            $('html, body').animate({
                scrollTop: $($(this).attr('href')).offset().top - offset
            }, function () {
                self.scrolling = false;
            });
        });

        $('#gotop').on('click', function (e) {
            e.preventDefault();

            $('body, html').stop().animate({
                scrollTop: 0
            });
        });

        function closeNavIfNeeded () {
            if (self.w.width() >= 990 && self.b.hasClass('navigation-is-open')) {
                self.b.removeClass('navigation-is-open');
                clearInterval(colorInterval);
            }
        }
        self.w.on('resize orientationchange', _.debounce(closeNavIfNeeded, 500));
    },

    pageInOut: function () {
        var self = this;

        $('body').on('click', 'a', function (e) {
            var me = $(this);
            var hr = me.attr('href');
            // return false;

            if (hr && hr !== '#' && hr.indexOf('http') != -1 && hr.indexOf('mailto') == -1 && hr.indexOf('tel') == -1 && me.attr('target') != '_blank' && ! me.hasClass('slide-m')) {
                e.preventDefault();
                setTimeout(function () {
                    self.b.animate({
                        opacity: 0
                    }, 500, function () {
                        window.location.href = hr;
                    });
                }, 100);
            }
        });
    },

    homeParallax: function () {
        var el = $('#welcome'),
            words = el.data('words'),
            wordsContainer = el.find('h1 em'),
            layers = el.find('.layer'),
            counter = 1;

        $('.scene').parallax();

        function tick() {
            layers.removeClass('active').eq(counter).addClass('active');

            if (self.ismobile) {
                wordsContainer.html(words[counter]).attr('class', 'color-' + counter);
                counter++;

                if (counter == 4) {
                    counter = 0;
                }
            } else {
                wordsContainer.addClass('hide');
                setTimeout(function () {
                    wordsContainer.html(words[counter]).attr('class', 'color-' + counter);
                    counter++;

                    if (counter == 4) {
                        counter = 0;
                    }
                }, 500);
            }
        }

        setInterval(tick, 3000);
    },

    waypoints: function () {
        var self = this,
            projects = $('.portfolioItem');

        $('.navSection').waypoint({
            handler: function (direction) {
                var cid = this.element.id;
                if (! self.scrolling) {
                    self.navLinks.removeClass('current').filter('[href="#' + cid + '"]').addClass('current');

                    if (this.element.id == 'work' && direction == 'up') {
                        self.navLinks.removeClass('current')
                    }
                }
            },
            offset: '90'
        });

        projects.waypoint({
            handler: function () {
                if (self.w.width() < 768) {
                    projects.each(function () {
                        $(this).data('gallery').reset();
                    });
                    $(this.element).data('gallery').animate();
                }
            },
            offset: 'bottom-in-view'
        });
    },

    homepage: function () {
        var self = this,
            welcome = $('#welcome');

        function setHeight () {
            var h;

            if (self.w.width() < 768) {
                h = window.innerHeight * 0.72;
            } else {
                h = window.innerHeight
            }

            welcome.css({
                height: h
            });
        }

        setHeight();

        if (this.ismobile) {
            self.w.on('orientationchange resize', _.debounce(setHeight, 100));

            setInterval(setHeight, 500);
        } else {
            self.w.on('resize', _.debounce(setHeight, 100));
        }
    },

    floatingNav2: function () {
        var self = this;
        var unfloated = false,
            el = $('.floatingNav'),
            welcome = $('#welcome'),
            welcomeHeight,
            lastOffset = 0,
            animating = false,
            welcomeLink = $('.pageNav a[href="#work"]'),
            movedUp = false;

        if (self.w.width() < 760) {
            return;
        }

        var recalcVariables = function () {
            welcomeHeight = welcome.height();
            self.w.trigger('scroll');

            if (self.w.width() >= 990) {
                welcomeHeight -= 60;
            }
        }
        recalcVariables();

        var doit = function () {
            var initialOffset = 50;
            var currentOffset = self.w.scrollTop(),
                scrollDown = true,
                moveTimer = false;

            if (lastOffset < currentOffset) {
                scrollDown = true;
            } else {
                scrollDown = false;
            }
            lastOffset = currentOffset;

            console.log(currentOffset, welcomeHeight);

            if (currentOffset >= initialOffset && unfloated == false && scrollDown) {
                if (! animating) {
                    unfloated = true;
                    animating = true

                    clearTimeout(moveTimer);
                    moveTimer = setTimeout(function () {
                        currentOffset = self.w.scrollTop();

                        if (currentOffset <= welcomeHeight && ! movedUp) {
                            $('body, html').stop().animate({
                                scrollTop: welcomeHeight + 62
                            }, 750, function () {
                                moveTimer = false;
                                movedUp = false;
                            });
                        }
                    }, 1500);

                    el.stop().animate({
                        'left': 0,
                        'margin-left': 0
                    }, 2000, function () {
                        animating = false;
                    });
                }
            }

            if (currentOffset < initialOffset && unfloated == true && scrollDown == false) {
                if (! animating) {
                    animating = true;
                    el.stop().animate({
                        'left': '100%',
                        'margin-left': -500
                    }, 2000, function () {
                        unfloated = false;
                        animating = false;
                    });
                }
            }

            if (currentOffset >= welcomeHeight && ! self.b.hasClass('header-is-visible')) {
                self.b.addClass('header-is-visible');
            }
            if (currentOffset < welcomeHeight && self.b.hasClass('header-is-visible')) {
                self.b.removeClass('header-is-visible');
            }

            if (! scrollDown) {
                movedUp = true;
            } else {
                movedUp = false;
            }
        }

        self.w.on('scroll', _.debounce(doit, 10));

        if (this.ismobile) {
            self.w.on('orientationchange load', recalcVariables);
            setTimeout(recalcVariables, 500);
        } else {
            self.w.on('resize', _.debounce(recalcVariables, 500));
        }
    },

    portfolioItems: function () {
        var items = $('.portfolioItem');

        items.each(function () {
            var me = $(this);
            me.data('gallery', new PGallery(me.find('figure')));
        });
    },

    clientsMagicList: function () {
        var clients = $('.dandClients li'),
            sectors = $('.dandSectors li'),
            services = $('.dandServices li');

        clients.on('mouseenter click', function (e) {
            var me = $(this),
                thisSectors = me.data('sectors'),
                thisServices = me.data('services');

            clients.add(sectors).add(services).removeClass('active');
            me.addClass('active');

            sectors.each(function (el, index) {
                var contained = $.inArray($(this).data('id'), thisSectors);
                if (contained >= 0) {
                    $(this).addClass('active');
                }
            });

            services.each(function (el, index) {
                var contained = $.inArray($(this).data('id'), thisServices);
                if (contained >= 0) {
                    $(this).addClass('active');
                }
            });

            e.preventDefault();
        });

        clients.add(sectors).add(services).on('mouseleave', function () {
            clients.add(sectors).add(services).removeClass('active');
        });
    },

    googlemap: function () {
        var self = this;
        var gmapel = $('#gmap');

        var mapdata = window._nazwaProjektu.mapdata;
        if (!mapdata || typeof mapdata !== 'object') {
            console.error('No map config found');
            return false;
        }

        var mapstyles = [{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#f9f9f9"},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#fffcfc"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":17}]}];

        self.map = new PUI.Gmap(gmapel, {
            lat: mapdata.center.lat,
            lng: mapdata.center.lng,
            markers: mapdata.markers,
            mapStyles: mapstyles,
            zoom: mapdata.zoom,
            disableDefaultUI: false,
            navigationControl: true,
            mapTypeControl: false,
            zoomControl: true,
            icon: undefined,
            scrollwheel: false,
            draggable: true,
            markersClickable: false,
            // infoWindowTemplate: mapdata.markerTemplate
        });
    },

    projectPage: function () {
        var slideHeader = $('.project-header-slide');

        $('.owl-carousel').each(function () {
            var carouselConfig = {
                items: 1,
                loop: true,
                dots: false,
                nav: true,
                autoplayHoverPause: true,
                navText: []
            },
            me = $(this),
            timeout = me.data('time');

            if (timeout && timeout != 0) {
                carouselConfig.autoplay = 'true';
                carouselConfig.autoplayTimeout = timeout * 1000;
            }

            if (! timeout && timeout != 0) {
                carouselConfig.autoplay = 'true';
                carouselConfig.autoplayTimeout = 3000;
            }

            $(this).owlCarousel(carouselConfig);
        });
    },
};

$(document).ready(function () {
    // safari love
    $(window).bind("pageshow", function(event) {
        if (event.originalEvent.persisted) {
            window.location.reload()
        }
    });

    NazwaProjektu.init();
});




var PGallery = function (el) {
    this.el = el;
    this.items = this.el.find('img');
    this.amnt = this.items.length - 1;
    this.count = 0;
    this.animateTimer;

    this.animate = function () {
        var self = this;
        this.el.addClass('active');
        this.items.filter(':visible').stop().fadeOut(500);
        this.items.eq(this.count).stop().fadeIn(500);

        this.count++;
        if (this.count > this.amnt) {
            this.count = 0;
        }

        this.animateTimer = setTimeout(function () {
            self.animate.call(self);
        }, 1000);
    };

    this.reset = function () {
        clearInterval(this.animateTimer);
        this.count = 0;
        this.el.removeClass('active');
        this.items.filter(':visible').stop().fadeOut(500);
        this.items.eq(0).stop().fadeIn(500);
    };

    this.init = function () {
        var self = this;
        this.el.on('mouseenter', function () {
            self.animate.call(self);
        });
        this.el.on('mouseleave', function () {
            self.reset.call(self);
        });
    }

    this.init();
}


})(jQuery);