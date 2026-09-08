package com.onlikee.module.auth.oauth.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.auth.oauth.model.entity.UserGithubEntity;

@Mapper
public interface AuthGithubMapper {

    //在user_github表中检测该用户是否存在
    @Select("select count(1) from user_github where github_id = #{githubId}")
    int countByGithubId(@Param("githubId") Long githubId);

    //github登录时注册插入user_github和user表记录
    @Insert("""
            insert into user_github
            (uuid, github_id, name, avatar_url, email, bio, html_url, github_token)
            values
            (#{uuid}, #{githubId}, #{name}, #{avatarUrl}, #{email}, #{bio}, #{htmlUrl}, #{githubToken})
            """)
    int insertUserGithub(UserGithubEntity userGithub);

    @Insert("""
            insert into "user"
            (uuid, nickname, email, avatar_url, last_login_source)
            values
            (#{uuid}, #{nickName}, #{email}, #{avatarUrl}, #{lastLoginSource})
            """)
    int insertUser(UserEntity user);

    default void saveUserGithubAndUser(UserGithubEntity userGithub, UserEntity user) {
        insertUserGithub(userGithub);
        insertUser(user);
    }

    @Update("""
            update user_github
            set name = #{name},
                avatar_url = #{avatarUrl},
                email = #{email},
                bio = #{bio},
                html_url = #{htmlUrl},
                github_token = #{githubToken}
            where github_id = #{githubId}
            """)
    int updateUserGithubByGithubId(UserGithubEntity userGithub);
}
