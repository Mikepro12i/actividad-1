
document.addEventListener('DOMContentLoaded', () => {

    
    const menuButtons = document.querySelectorAll('.menu-button');
    
   
    const contentSections = document.querySelectorAll('.content-section');

  
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            
            
            const targetId = button.dataset.target;
            const targetSection = document.getElementById(targetId);

          
            menuButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            button.classList.add('active');


           
            contentSections.forEach(section => {
                section.classList.remove('is-active');
            });
            

            if (targetSection) {
                targetSection.classList.add('is-active');
            }
        });
    });

   
    document.querySelector('.menu-button.active').click();

});