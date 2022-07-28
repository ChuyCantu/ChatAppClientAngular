import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
    {
        path: "home",
        loadChildren: () => import("./chat/chat.module").then(m => m.ChatModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ]
    },
    {
        path: "auth",
        loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
    },
    {
        path: "**",
        redirectTo: "home"
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
