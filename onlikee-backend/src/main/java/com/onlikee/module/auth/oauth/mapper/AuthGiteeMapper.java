package com.onlikee.module.auth.oauth.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.auth.oauth.model.entity.UserGiteeEntity;

@Mapper
public interface AuthGiteeMapper {

    //在user_gitee表中检测该用户是否存在
    @Select("select count(1) from user_gitee where gitee_id = #{giteeId}")
    int countByGiteeId(@Param("giteeId") Long giteeId);

    //gitee登录时注册插入user_gitee和user表记录
    @Insert("""
            insert into user_gitee
            (uuid, gitee_id, name, avatar_url, email, bio, html_url, gitee_token)
            values
            (#{uuid}, #{giteeId}, #{name}, #{avatarUrl}, #{email}, #{bio}, #{htmlUrl}, #{giteeToken})
            """)
    int insertUserGitee(UserGiteeEntity userGitee);

    @Insert("""
            insert into "user"
            (uuid, nickname, email, avatar_url, last_login_source)
            values
            (#{uuid}, #{nickName}, #{email}, #{avatarUrl}, #{lastLoginSource})
            """)
    int insertUser(UserEntity user);

    default void saveUserGiteeAndUser(UserGiteeEntity userGitee, UserEntity user) {
        insertUserGitee(userGitee);
        insertUser(user);
    }

    @Update("""
            update user_gitee
            set name = #{name},
                avatar_url = #{avatarUrl},
                email = #{email},
                bio = #{bio},
                html_url = #{htmlUrl},
                gitee_token = #{giteeToken}
            where gitee_id = #{giteeId}
            """)
    int updateUserGiteeByGiteeId(UserGiteeEntity userGitee);
}
